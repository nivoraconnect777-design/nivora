import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import CreateStoryModal from './CreateStoryModal';
import StoryViewer from './StoryViewer';

interface StoryUser {
    user: {
        id: string;
        username: string;
        profilePicUrl: string;
    };
    stories: any[];
    hasUnseen: boolean;
}

interface StoryTrayProps {
    isDark: boolean;
}

export default function StoryTray({ isDark }: StoryTrayProps) {
    const { user } = useAuthStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const { data: storyUsers = [], isLoading } = useQuery({
        queryKey: ['stories'],
        queryFn: async () => {
            const response = await api.get('/api/stories/feed');
            return response.data.data;
        },
        refetchInterval: 60000,
    });

    // Find current user's story
    const myStoryIndex = storyUsers.findIndex((s: StoryUser) => s.user.id === user?.id);
    const hasMyStory = myStoryIndex !== -1;

    // Filter out current user from the list to avoid duplication
    const otherStories = storyUsers.filter((s: StoryUser) => s.user.id !== user?.id);

    const handleStoryClick = (index: number, isMyStory: boolean = false) => {
        if (isMyStory) {
            setSelectedStoryIndex(myStoryIndex);
        } else {
            // Adjust index because we filtered out the current user
            const actualIndex = storyUsers.findIndex((s: StoryUser) => s.user.id === otherStories[index].user.id);
            setSelectedStoryIndex(actualIndex);
        }
    };

    const handleMyStoryClick = () => {
        if (hasMyStory) {
            handleStoryClick(0, true);
        } else {
            setIsCreateModalOpen(true);
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar h-full px-2">
                {/* Your Story */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMyStoryClick}
                    className="flex flex-col items-center gap-1 min-w-[80px]"
                >
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-full p-[3px] ${hasMyStory
                                ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600'
                                : `border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`
                            }`}>
                            <div className={`w-full h-full rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                } ${hasMyStory ? `border-2 ${isDark ? 'border-black' : 'border-white'}` : ''}`}>
                                {user?.profilePicUrl ? (
                                    <img
                                        src={user.profilePicUrl}
                                        alt="Your story"
                                        className={`w-full h-full object-cover ${!hasMyStory ? 'opacity-50' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xs font-bold">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!hasMyStory && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-black">
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    <span className={`text-xs truncate w-full text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Your Story
                    </span>
                </motion.button>

                {/* Story List */}
                {isLoading ? (
                    <div className="flex items-center justify-center w-full py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : (
                    otherStories.map((storyUser: StoryUser, index: number) => (
                        <motion.button
                            key={storyUser.user.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStoryClick(index)}
                            className="flex flex-col items-center gap-1 min-w-[80px]"
                        >
                            <div className={`w-20 h-20 rounded-full p-[3px] ${storyUser.hasUnseen
                                ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600'
                                : isDark ? 'bg-gray-700' : 'bg-gray-300'
                                }`}>
                                <div className={`w-full h-full rounded-full border-2 ${isDark ? 'border-black' : 'border-white'
                                    } overflow-hidden`}>
                                    <img
                                        src={storyUser.user.profilePicUrl || `https://ui-avatars.com/api/?name=${storyUser.user.username}`}
                                        alt={storyUser.user.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <span className={`text-xs truncate w-20 text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                {storyUser.user.username}
                            </span>
                        </motion.button>
                    ))
                )}
            </div>

            {/* Modals */}
            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {selectedStoryIndex !== null && (
                <StoryViewer
                    initialUserIndex={selectedStoryIndex}
                    storyUsers={storyUsers}
                    onClose={() => setSelectedStoryIndex(null)}
                />
            )}
        </>
    );
}
