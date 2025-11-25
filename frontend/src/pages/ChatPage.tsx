import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useChatContext,
} from 'stream-chat-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import api from '../lib/api';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

const ChatInitializer = ({ targetUserId }: { targetUserId?: string }) => {
    const { client, setActiveChannel } = useChatContext();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!targetUserId || !client || !user) return;

        const setupChannel = async () => {
            const channel = client.channel('messaging', {
                members: [user.id, targetUserId],
            });
            await channel.watch();
            setActiveChannel(channel);
        };

        setupChannel();
    }, [targetUserId, client, user, setActiveChannel]);

    return null;
};

export default function ChatPage() {
    const { user } = useAuthStore();
    const { isDark } = useThemeStore();
    const [client, setClient] = useState<StreamChat | null>(null);
    const location = useLocation();
    const targetUserId = location.state?.targetUserId;

    useEffect(() => {
        if (!user || !apiKey) return;

        let chatClient: StreamChat;

        const initChat = async () => {
            chatClient = StreamChat.getInstance(apiKey);

            try {
                // Get token from backend
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
            } catch (error) {
                console.error('Failed to connect to Stream Chat', error);
            }
        };

        initChat();

        return () => {
            if (chatClient) {
                chatClient.disconnectUser();
                setClient(null);
            }
        };
    }, [user]);

    if (!client) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filters = { type: 'messaging', members: { $in: [user!.id] } };
    const sort: any = { last_message_at: -1 };

    return (
        <div className={`h-[calc(100vh-64px)] ${isDark ? 'str-chat__theme-dark' : 'str-chat__theme-light'}`}>
            <Chat client={client} theme={isDark ? 'str-chat__theme-dark' : 'str-chat__theme-light'}>
                <ChatInitializer targetUserId={targetUserId} />
                <ChannelList
                    filters={filters}
                    sort={sort}
                    showChannelSearch
                />
                <Channel>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}
