import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Image as ImageIcon, MoreVertical, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

interface Message {
    id: string;
    text: string;
    imageUrl?: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        profilePicUrl: string;
    };
}

interface ChatWindowProps {
    conversationId: string;
    currentUser: any;
    otherUser: any;
    onBack: () => void;
}

export default function ChatWindow({ conversationId, currentUser, otherUser, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { isDark } = useThemeStore();

    useEffect(() => {
        // Initialize socket - use the same base URL as API
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
            auth: {
                token: localStorage.getItem('token'), // Assuming token is stored in localStorage
            },
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && conversationId) {
            socket.emit('join_conversation', conversationId);

            socket.on('new_message', (message: Message) => {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            });

            return () => {
                socket.emit('leave_conversation', conversationId);
                socket.off('new_message');
            };
        }
    }, [socket, conversationId]);

    useEffect(() => {
        fetchMessages();
    }, [conversationId]);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/api/messages/${conversationId}`);
            setMessages(response.data.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post('/api/messages', {
                conversationId,
                text: newMessage,
                receiverId: otherUser.id
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className={`flex flex-col h-full ${isDark ? 'bg-black' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <button onClick={onBack} className="md:hidden mr-4">
                    <ArrowLeft className={isDark ? 'text-white' : 'text-gray-900'} />
                </button>
                <img
                    src={otherUser.profilePicUrl || `https://ui-avatars.com/api/?name=${otherUser.username}`}
                    alt={otherUser.username}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {otherUser.displayName || otherUser.username}
                    </h3>
                    <span className="text-xs text-green-500">Online</span>
                </div>
                <button>
                    <MoreVertical className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isOwn = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : `${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} rounded-bl-none`
                                }`}>
                                <p>{msg.text}</p>
                                <span className={`text-[10px] block text-right mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${isDark ? 'bg-gray-900' : 'bg-gray-100'
                    }`}>
                    <button type="button" className="text-gray-500 hover:text-blue-500">
                        <ImageIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className={`flex-1 bg-transparent border-none focus:ring-0 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`text-blue-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
