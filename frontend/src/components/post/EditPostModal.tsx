import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        id: string;
        caption: string | null;
    };
    onUpdate: (newCaption: string) => void;
}

export default function EditPostModal({ isOpen, onClose, post, onUpdate }: EditPostModalProps) {
    const { isDark } = useThemeStore();
    const [caption, setCaption] = useState(post.caption || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCaption(post.caption || '');
    }, [post.caption, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.put(`/api/posts/${post.id}`, {
                caption: caption.trim(),
            });

            if (response.data.success) {
                toast.success('Post updated successfully');
                onUpdate(caption.trim());
                onClose();
            }
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error('Failed to update post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-lg rounded-2xl shadow-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Post</h3>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4">
                                <div className="mb-4">
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px] ${isDark
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                            }`}
                                        placeholder="Write a caption..."
                                        maxLength={2200}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                                                ? 'text-gray-300 hover:bg-gray-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
