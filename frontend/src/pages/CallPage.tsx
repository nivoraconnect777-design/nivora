import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    StreamCall,
    StreamTheme,
    CallControls,
    useStreamVideoClient,
    Call,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Loader2 } from 'lucide-react';
import OneOnOneLayout from '../components/call/OneOnOneLayout';

export default function CallPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const client = useStreamVideoClient();
    const [call, setCall] = useState<Call | null>(null);

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
                    <CallControls onLeave={() => navigate('/messages')} />
                </div>
            </StreamTheme>
        </StreamCall>
    );
}
