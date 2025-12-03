import { useEffect, useState } from 'react';
import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-sdk';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import IncomingCallAlert from '../components/call/IncomingCallAlert';
import { Loader2 } from 'lucide-react';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

interface StreamVideoProviderProps {
    children: React.ReactNode;
}

export default function StreamVideoProvider({ children }: StreamVideoProviderProps) {
    const { user } = useAuthStore();
    const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

    useEffect(() => {
        // Don't initialize if no user or no API key
        if (!user || !apiKey) {
            setVideoClient(null);
            return;
        }

        let client: StreamVideoClient;
        let isMounted = true;

        const initVideo = async () => {
            try {
                const { data } = await api.post('/api/stream/token');

                // Check if component is still mounted before setting state
                if (!isMounted) return;

                const streamUser: User = {
                    id: user.id,
                    name: user.username,
                    image: user.profilePicUrl || undefined,
                };

                client = new StreamVideoClient({
                    apiKey,
                    user: streamUser,
                    token: data.token,
                });

                setVideoClient(client);
            } catch (error: any) {
                console.error('Failed to connect to Stream Video', error);
                // Don't set client if initialization fails
                // This prevents infinite retry loops
                if (isMounted) {
                    setVideoClient(null);
                }
            }
        };

        initVideo();

        return () => {
            isMounted = false;
            if (client) {
                client.disconnectUser().catch(console.error);
            }
        };
    }, [user]);

    if (!videoClient) {
        // If user is logged in but client not ready, maybe show loader or just children?
        // If we just show children, IncomingCallAlert won't work yet.
        // But we don't want to block the whole app if video fails.
        // So we'll just render children.
        return <>{children}</>;
    }

    return (
        <StreamVideo client={videoClient}>
            {children}
            <IncomingCallAlert />
        </StreamVideo>
    );
}
