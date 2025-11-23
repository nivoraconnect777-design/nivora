import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../lib/api';

interface Reel {
    id: string;
    content: string;
    mediaUrl: string;
    user: {
        id: string;
        username: string;
        profilePicUrl: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
    isLiked: boolean;
}

export default function ReelsPage() {
    const { isDark } = useThemeStore();
    const [muted, setMuted] = useState(true);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['reels'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get(`/api/reels?page=${pageParam}&limit=5`);
            return response.data.data;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });

    if (status === 'pending') {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex justify-center items-center h-screen bg-black text-white">
                <p>Error loading reels</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] md:h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar">
            {data.pages.map((page) =>
                page.reels.map((reel: Reel, index: number) => (
                    <ReelItem
                        key={reel.id}
                        reel={reel}
                        muted={muted}
                        toggleMute={() => setMuted(!muted)}
                        onEnd={() => {
                            if (index === data.pages.flatMap(p => p.reels).length - 2 && hasNextPage) {
                                fetchNextPage();
                            }
                        }}
                    />
                ))
            )}
            {data.pages[0].reels.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <p className="text-xl font-bold">No Reels Yet</p>
                    <p className="text-gray-400">Be the first to upload one!</p>
                </div>
            )}
        </div>
    );
}

function ReelItem({ reel, muted, toggleMute, onEnd }: { reel: Reel; muted: boolean; toggleMute: () => void; onEnd: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { ref, inView } = useInView({
        threshold: 0.6,
    });

    useEffect(() => {
        if (inView) {
            videoRef.current?.play().catch(() => { });
            onEnd();
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [inView, onEnd]);

    return (
        <div ref={ref} className="h-full w-full snap-start relative flex items-center justify-center bg-black">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={reel.mediaUrl}
                className="h-full w-full md:w-auto md:max-w-md object-cover"
                loop
                muted={muted}
                playsInline
                onClick={toggleMute}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 md:w-auto md:max-w-md md:mx-auto pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
                    <div className="flex items-end justify-between">
                        {/* User Info & Caption */}
                        <div className="flex-1 mr-4 pointer-events-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={reel.user.profilePicUrl || `https://ui-avatars.com/api/?name=${reel.user.username}`}
                                    alt={reel.user.username}
                                    className="w-10 h-10 rounded-full border-2 border-white"
                                />
                                <span className="text-white font-bold drop-shadow-md">{reel.user.username}</span>
                                <button className="px-3 py-1 bg-transparent border border-white/50 text-white text-xs rounded-full hover:bg-white/20 transition-colors">
                                    Follow
                                </button>
                            </div>
                            <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-4">{reel.content}</p>
                        </div>

                        {/* Side Actions */}
                        <div className="flex flex-col items-center gap-6 pointer-events-auto pb-4">
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-colors">
                                    <Heart className={`w-7 h-7 ${reel.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                </div>
                                <span className="text-white text-xs font-medium">{reel._count.likes}</span>
                            </button>

                            <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-colors">
                                    <MessageCircle className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium">{reel._count.comments}</span>
                            </button>

                            <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-black/20 backdrop-blur-sm rounded-full group-hover:bg-black/40 transition-colors">
                                    <Share2 className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium">Share</span>
                            </button>

                            <button onClick={toggleMute} className="p-3 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors">
                                {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
