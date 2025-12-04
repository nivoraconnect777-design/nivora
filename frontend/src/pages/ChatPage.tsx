import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { ArrowLeft, Send, Loader2, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

interface Message {
    id: string;
    text: string;
    user: {
        id: string;
        name: string;
        image?: string;
    };
    created_at: Date;
}

export default function ChatPage() {
    const { user } = useAuthStore();
    const { isDark } = useThemeStore();
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channels, setChannels] = useState<StreamChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const targetUserId = location.state?.targetUserId;
    const videoClient = useStreamVideoClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Stream Chat
    useEffect(() => {
        if (!user || !apiKey) return;

        let chatClient: StreamChat;

        const initChat = async () => {
            try {
                chatClient = StreamChat.getInstance(apiKey);
                const { data } = await api.post('/api/stream/token');

                await chatClient.connectUser(
                    {
                        id: user.id,
                        name: user.username,
                        image: user.profilePicUrl,
                    },
                    data.token
                );

                setClient(chatClient);

                // Load user's channels
                const filter = { type: 'messaging', members: { $in: [user.id] } };
                const sort: any = { last_message_at: -1 };
                const channelList = await chatClient.queryChannels(filter, sort, { limit: 20 });
                setChannels(channelList);

                // If target user specified, create/open channel
                if (targetUserId && targetUserId !== user.id) {
                    const channel = chatClient.channel('messaging', {
                        members: [user.id, targetUserId],
                    });
                    await channel.watch();
                    setActiveChannel(channel);
                    loadMessages(channel);
                } else if (channelList.length > 0 && window.innerWidth >= 768) {
                    // Only auto-select on desktop
                    setActiveChannel(channelList[0]);
                    loadMessages(channelList[0]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Failed to connect to Stream Chat', error);
                setLoading(false);
            }
        };

        initChat();

        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
            }
        };
    }, [user, targetUserId]);

    // Listen for new messages
    useEffect(() => {
        if (!activeChannel) return;

        const handleNewMessage = (event: any) => {
            if (event.message) {
                setMessages((prev) => [...prev, event.message]);
            }
        };

        activeChannel.on('message.new', handleNewMessage);

        return () => {
            activeChannel.off('message.new', handleNewMessage);
        };
    }, [activeChannel]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async (channel: StreamChannel) => {
        const response = await channel.query({ messages: { limit: 50 } });
        setMessages(response.messages as any);
    };

    const handleChannelSelect = async (channel: StreamChannel) => {
        setActiveChannel(channel);
        await loadMessages(channel);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !activeChannel) return;

        try {
            await activeChannel.sendMessage({
                text: messageText,
            });
            setMessageText('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const getOtherMember = (channel: StreamChannel) => {
        const members = Object.values(channel.state.members);
        return members.find((m: any) => m.user?.id !== user?.id)?.user;
    };

    const formatTime = (date: Date) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else {
            return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const handleVideoCall = async () => {
        if (!activeChannel || !videoClient || !user) return;

        const otherUser = getOtherMember(activeChannel);
        if (!otherUser) return;

        // Stream Call ID must be < 64 chars. 
        // Using a random string + timestamp is sufficient for uniqueness.
        const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const call = videoClient.call('default', callId);

        try {
            await call.getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: user.id },
                        { user_id: otherUser.id },
                    ],
                },
            });

            // Send "Call Started" message
            await activeChannel.sendMessage({
                text: `📞 Video call started at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            });

            navigate(`/call/${callId}`, { state: { channelId: activeChannel.id } });
        } catch (error) {
            console.error('Failed to start call', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Conversations List */}
            <div className={`${activeChannel ? 'hidden md:block' : 'w-full'} md:w-96 border-r ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-80px)] scrollbar-hide">
                    {channels.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                No conversations yet. Start chatting by visiting someone's profile!
                            </p>
                        </div>
                    ) : (
                        channels.map((channel) => {
                            const otherUser = getOtherMember(channel);
                            const lastMessage = channel.state.messages[channel.state.messages.length - 1];

                            return (
                                <motion.div
                                    key={channel.id}
                                    whileHover={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}
                                    onClick={() => handleChannelSelect(channel)}
                                    className={`p-4 cursor-pointer border-b ${isDark ? 'border-gray-800' : 'border-gray-100'
                                        } ${activeChannel?.id === channel.id ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
                                            {otherUser?.image ? (
                                                <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                                    {otherUser?.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {otherUser?.name || 'Unknown User'}
                                            </h3>
                                            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {lastMessage?.text || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            {activeChannel ? (
                <div className="flex-1 flex flex-col w-full md:w-auto">
                    {/* Chat Header */}
                    <div className={`fixed md:relative top-0 left-0 right-0 z-50 p-4 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} flex items-center gap-3`}>
                        <button
                            onClick={() => setActiveChannel(null)}
                            className={`md:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        {(() => {
                            const otherUser = getOtherMember(activeChannel);
                            return (
                                <>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
                                        {otherUser?.image ? (
                                            <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                                {otherUser?.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={`font-semibold text-lg flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {otherUser?.name || 'Unknown User'}
                                    </h3>
                                    <button
                                        onClick={handleVideoCall}
                                        className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                                        title="Start Video Call"
                                    >
                                        <Video className="w-6 h-6" />
                                    </button>
                                </>
                            );
                        })()}
                    </div>

                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto p-4 pt-20 md:pt-4 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        {messages.map((message) => {
                            const isOwn = message.user?.id === user?.id;
                            const otherUser = getOtherMember(activeChannel);
                            return (
                                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
                                    {/* Profile Picture for other person's messages */}
                                    {!isOwn && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0">
                                            {otherUser?.image ? (
                                                <img src={otherUser.image} alt={otherUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                                    {otherUser?.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${isOwn
                                            ? 'bg-blue-500 text-white'
                                            : isDark
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white text-gray-900'
                                            }`}>
                                            <p className="break-words">{message.text}</p>
                                        </div>
                                        <span className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {formatTime(message.created_at)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type a message..."
                                className={`flex-1 px-4 py-2 rounded-full border ${isDark
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!messageText.trim()}
                                className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={`hidden md:flex flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="text-center">
                        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Select a conversation to start chatting
                        </p>
                    </div>
                </div>
            )
            }
        </div >
    );
}
