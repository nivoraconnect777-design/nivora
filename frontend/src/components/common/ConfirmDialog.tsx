import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
}: ConfirmDialogProps) {
    const { isDark } = useThemeStore();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        },
        warning: {
            icon: 'text-yellow-500',
            confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        },
        info: {
            icon: 'text-blue-500',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
                                }`}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="p-6">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                                    }`}>
                                    <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                                </div>

                                {/* Title */}
                                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {title}
                                </h2>

                                {/* Message */}
                                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    {message}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${isDark
                                                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${styles.confirmButton}`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
