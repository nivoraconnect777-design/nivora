import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';

interface CreateMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateMenu({ isOpen, onClose }: CreateMenuProps) {
    const { isDark } = useThemeStore();
    const { openCreatePostModal, openCreateStoryModal } = useUIStore();

    const handleCreatePost = () => {
        onClose();
        openCreatePostModal();
    };

    const handleCreateStory = () => {
        onClose();
        openCreateStoryModal();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] z-50 rounded-2xl shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                            }`}
                        style={{ marginLeft: 0, marginRight: 0 }}
                    >
                        {/* Header */}
                        <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Create
                                </h2>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreatePost}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${isDark
                                    ? 'hover:bg-gray-800 text-gray-300'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                    <Image className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Create Post
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Share a photo or video
                                    </p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateStory}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${isDark
                                    ? 'hover:bg-gray-800 text-gray-300'
                                    : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-orange-500">
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Create Story
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Share a moment that disappears in 24h
                                    </p>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
