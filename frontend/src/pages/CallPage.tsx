import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    StreamCall,
    StreamTheme,
    CallControls,
    useStreamVideoClient,
    Call,
} from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Loader2 } from 'lucide-react';
import OneOnOneLayout from '../components/call/OneOnOneLayout';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

const chatApiKey = import.meta.env.VITE_STREAM_API_KEY;

export default function CallPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const client = useStreamVideoClient();
    const [call, setCall] = useState<Call | null>(null);
    const { user } = useAuthStore();
    const channelId = location.state?.channelId;

    useEffect(() => {
        if (!client || !id) return;

        const myCall = client.call('default', id);

        // Join the call
        myCall.join({ create: true })
            .then(() => setCall(myCall))
            .catch((err) => {
                console.error('Failed to join call', err);
            });

        return () => {
            // Cleanup if necessary
        };
    }, [client, id]);

    const handleLeave = async () => {
        if (channelId && user && chatApiKey) {
            try {
                // We need to send a message to the chat channel.
                // Since we might not have the chat client initialized here, we'll do a quick init.
                // Ideally this should be in a global context, but this works for now.
                const chatClient = StreamChat.getInstance(chatApiKey);

                // We reuse the token from the video client if possible, or fetch a new one.
                // Video client token is usually valid for chat too if generated with same secret.
                // Let's try to fetch a token just to be safe/standard.
                const { data } = await api.post('/api/stream/token');

                await chatClient.connectUser(
                    { id: user.id },
                    data.token
                );

                const channel = chatClient.channel('messaging', channelId);
                await channel.sendMessage({
                    text: `📞 Video call ended at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                });

                await chatClient.disconnectUser();
            } catch (error) {
                console.error('Failed to send end call message', error);
            }
        }
        navigate('/messages');
    };

    if (!call) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <StreamCall call={call}>
            <StreamTheme>
                <div className="h-screen w-screen bg-gray-900 flex flex-col">
                    <OneOnOneLayout />
                    <CallControls onLeave={handleLeave} />
                </div>
            </StreamTheme>
        </StreamCall>
    );
}
