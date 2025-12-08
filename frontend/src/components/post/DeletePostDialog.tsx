import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface DeletePostDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export default function DeletePostDialog({ isOpen, onClose, onConfirm, isLoading }: DeletePostDialogProps) {
    const { isDark } = useThemeStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={`w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Post?</h3>
                            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    Delete
                                </button>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${isDark
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
