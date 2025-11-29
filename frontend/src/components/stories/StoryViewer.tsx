import ReactDOM from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Send, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

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
    className = "h-full bg-white transition-all duration-100 ease-linear"
    style = {{
        width: idx < currentStoryIndex ? '100%' :
            idx === currentStoryIndex ? `${progress}%` : '0%'
    }
}
                            />
                        </div >
                    ))}
                </div >

    {/* User Info */ }
    < div className = "absolute top-8 left-4 z-20 flex items-center gap-3" >
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
                </div >

    {/* Options Menu (Owner Only) */ }
{
    currentUserData.user.id === currentUser?.id && (
        <div className="absolute top-8 right-16 z-30">
            <button
                onClick={() => {
                    setIsPaused(true);
                    setShowOptions(!showOptions);
                }}
                className="text-white p-1 hover:bg-white/10 rounded-full"
            >
                <MoreHorizontal className="w-6 h-6" />
            </button>

            {showOptions && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-gray-700 text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

{/* Media */ }
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

{/* Navigation Tap Areas */ }
<div className="absolute inset-0 z-10 flex">
    <div className="w-1/3 h-full" onClick={handlePrev} />
    <div className="w-2/3 h-full" onClick={handleNext} />
</div>

{/* Footer / Reply / Viewers */ }
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

{/* Viewers Sheet */ }
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
            </div >
        </div >,
    document.body
    );
}
