import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Send } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

interface Story {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    duration: number; // in ms
    createdAt: string;
    isViewed: boolean;
}

interface StoryUser {
    user: {
        id: string;
        username: string;
        profilePicUrl: string;
    };
    stories: Story[];
}

interface StoryViewerProps {
    initialUserIndex: number;
    storyUsers: StoryUser[];
    onClose: () => void;
}

export default function StoryViewer({ initialUserIndex, storyUsers, onClose }: StoryViewerProps) {
    const { user: currentUser } = useAuthStore();
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [viewers, setViewers] = useState<any[]>([]);
    const [showViewers, setShowViewers] = useState(false);

    const currentUserData = storyUsers[currentUserIndex];
    const currentStory = currentUserData.stories[currentStoryIndex];

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressInterval = useRef<NodeJS.Timeout>();

    // Mark as viewed when story opens
    useEffect(() => {
        if (currentStory && !currentStory.isViewed && currentUserData.user.id !== currentUser?.id) {
            api.post(`/api/stories/${currentStory.id}/view`).catch(console.error);
        }
    }, [currentStory, currentUserData.user.id, currentUser?.id]);

    // Fetch viewers if it's own story
    useEffect(() => {
        if (currentUserData.user.id === currentUser?.id && showViewers) {
            api.get(`/api/stories/${currentStory.id}/viewers`)
                .then(res => setViewers(res.data.data))
                .catch(console.error);
        }
    }, [currentStory.id, currentUserData.user.id, currentUser?.id, showViewers]);

    // Progress timer
    useEffect(() => {
        if (isPaused || showViewers) return;

        const duration = currentStory.duration || 5000;
        const intervalTime = 50;
        const step = (intervalTime / duration) * 100;

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(progressInterval.current);
    }, [currentStory, isPaused, showViewers]);

    // Reset progress when story changes
    useEffect(() => {
        setProgress(0);
        if (currentStory.mediaType === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    }, [currentStoryIndex, currentUserIndex]);

    const handleNext = () => {
        if (currentStoryIndex < currentUserData.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else if (currentUserIndex < storyUsers.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else if (currentUserIndex > 0) {
            setCurrentUserIndex(prev => prev - 1);
            setCurrentStoryIndex(storyUsers[currentUserIndex - 1].stories.length - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white p-2"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Main Content */}
            <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900">

                {/* Progress Bars */}
                <div className="absolute top-4 left-2 right-2 z-20 flex gap-1">
                    {currentUserData.stories.map((story, idx) => (
                        <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: idx < currentStoryIndex ? '100%' :
                                        idx === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* User Info */}
                <div className="absolute top-8 left-4 z-20 flex items-center gap-3">
                    <img
                        src={currentUserData.user.profilePicUrl}
                        alt={currentUserData.user.username}
                        className="w-8 h-8 rounded-full border border-white"
                    />
                    <span className="text-white font-semibold text-sm">
                        {currentUserData.user.username}
                    </span>
                    <span className="text-white/60 text-xs">
                        {new Date(currentStory.createdAt).getHours()}h
                    </span>
                </div>

                {/* Media */}
                <div
                    className="w-full h-full flex items-center justify-center bg-black"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {currentStory.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-cover"
                            playsInline
                            muted // Auto-play usually requires muted initially
                        />
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Navigation Tap Areas */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev} />
                    <div className="w-2/3 h-full" onClick={handleNext} />
                </div>

                {/* Footer / Reply / Viewers */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
                    {currentUserData.user.id === currentUser?.id ? (
                        <button
                            onClick={() => setShowViewers(true)}
                            className="flex items-center gap-2 text-white mb-4"
                        >
                            <Eye className="w-5 h-5" />
                            <span className="text-sm font-medium">{viewers.length} views</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Send message..."
                                    className="w-full bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:border-white"
                                />
                            </div>
                            <button className="p-2">
                                <Heart className="w-7 h-7 text-white" />
                            </button>
                            <button className="p-2">
                                <Send className="w-7 h-7 text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Viewers Sheet */}
                <AnimatePresence>
                    {showViewers && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="absolute inset-0 z-30 bg-gray-900 rounded-t-2xl mt-20"
                        >
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-white font-bold">Viewers</h3>
                                <button onClick={() => setShowViewers(false)}>
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto h-full pb-20">
                                {viewers.map((view) => (
                                    <div key={view.user.id} className="flex items-center gap-3 mb-4">
                                        <img
                                            src={view.user.profilePicUrl}
                                            alt={view.user.username}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{view.user.username}</p>
                                            <p className="text-gray-400 text-xs">{view.user.displayName}</p>
                                        </div>
                                    </div>
                                ))}
                                {viewers.length === 0 && (
                                    <p className="text-gray-500 text-center mt-10">No views yet</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
