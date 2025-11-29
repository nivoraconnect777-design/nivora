import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalls, CallingState, Call } from '@stream-io/video-react-sdk';
import { Phone, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IncomingCallAlert() {
    const calls = useCalls();
    const navigate = useNavigate();
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);

    useEffect(() => {
        // Filter for incoming calls that are ringing
        const ringingCall = calls.find(
            (call) =>
                call.isCreatedByMe === false &&
                call.state.callingState === CallingState.RINGING
        );

        setIncomingCall(ringingCall || null);
    }, [calls]);

    const handleAccept = async () => {
        if (incomingCall) {
            await incomingCall.join();
            navigate(`/call/${incomingCall.id}`);
            setIncomingCall(null);
        }
    };

    const handleReject = async () => {
        if (incomingCall) {
            await incomingCall.leave({ reject: true });
            setIncomingCall(null);
        }
    };

    if (!incomingCall) return null;

    const caller = incomingCall.state.createdBy;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-80 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {caller?.image ? (
                            <img src={caller.image} alt={caller.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-xl">
                                {caller?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg dark:text-white">
                            {caller?.name || 'Unknown Caller'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Incoming Video Call...</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-between">
                    <button
                        onClick={handleReject}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                    >
                        <PhoneOff className="w-5 h-5" />
                        Reject
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
                    >
                        <Phone className="w-5 h-5" />
                        Accept
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
