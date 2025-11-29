import { useCallStateHooks, ParticipantView } from '@stream-io/video-react-sdk';
import { Loader2 } from 'lucide-react';

export default function OneOnOneLayout() {
    const { useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
    const localParticipant = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();

    // In a 1-on-1 call, there should be at most 1 remote participant.
    const remoteParticipant = remoteParticipants[0];

    if (!remoteParticipant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-900 text-white relative">
                {/* Show local participant centered while waiting */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {localParticipant && (
                        <div className="w-full h-full max-w-4xl max-h-[80vh] p-4">
                            <ParticipantView
                                participant={localParticipant}
                                trackType="videoTrack"
                                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                            />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <div className="text-center p-6 bg-black/60 rounded-xl backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                            <h2 className="text-xl font-semibold">Waiting for others to join...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative bg-gray-900 overflow-hidden p-4">
            {/* Remote Participant (Main View) */}
            <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <ParticipantView
                    participant={remoteParticipant}
                    trackType="videoTrack"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-md">
                    <span className="text-white font-medium text-sm">
                        {remoteParticipant.name || remoteParticipant.userId}
                    </span>
                </div>
            </div>

            {/* Local Participant (Floating Picture-in-Picture) */}
            {localParticipant && (
                <div className="absolute bottom-8 right-8 w-48 h-36 md:w-64 md:h-48 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700 z-20">
                    <ParticipantView
                        participant={localParticipant}
                        trackType="videoTrack"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md">
                        <span className="text-white text-xs">You</span>
                    </div>
                </div>
            )}
        </div>
    );
}
