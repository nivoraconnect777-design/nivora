import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, X, Loader2, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import api from '../../lib/api';

export default function CreatePostModal() {
    const { user } = useAuthStore();
    const { isCreatePostModalOpen, closeCreatePostModal, triggerFeedRefresh } = useUIStore();
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1080; // Reasonable max width for posts
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('video')) {
                // Check video size (limit to 4MB for Vercel serverless)
                if (file.size > 4 * 1024 * 1024) {
                    alert('Video file is too large. Please upload a video smaller than 4MB.');
                    return;
                }
                setMediaFile(file);
                setMediaType('video');
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                try {
                    const compressedDataUrl = await compressImage(file);
                    setMediaFile(file);
                    setMediaType('image');
                    setMediaPreview(compressedDataUrl);
                } catch (error) {
                    console.error('Error compressing image:', error);
                    alert('Failed to process image.');
                }
            }
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!mediaPreview) return;

        setIsLoading(true);
        try {
            await api.post('/api/posts', {
                caption,
                mediaUrl: mediaPreview,
                mediaType,
            });

            setCaption('');
            clearMedia();
            triggerFeedRefresh();
            closeCreatePostModal();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isCreatePostModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCreatePostModal}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Create New Post
                                </h2>
                                <button
                                    onClick={closeCreatePostModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {/* User Info */}
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                                            {user?.profilePicUrl ? (
                                                <img
                                                    src={user.profilePicUrl}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800">
                                                    {user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {user?.username}
                                    </span>
                                </div>

                                {/* Media Preview or Upload Placeholder */}
                                <div className="mb-6">
                                    <AnimatePresence mode="wait">
                                        {mediaPreview ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square group"
                                            >
                                                {mediaType === 'video' ? (
                                                    <video
                                                        src={mediaPreview}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={mediaPreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <button
                                                    onClick={clearMedia}
                                                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                                            >
                                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <PlusSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                    Add photos or videos
                                                </p>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                                    Drag and drop or click to upload
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Caption Input */}
                                <div className="mb-6">
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Write a caption..."
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[100px]"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Add Photo/Video"
                                        >
                                            <Image className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                            }}
                                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                            title="Add Video"
                                        >
                                            <Video className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!mediaPreview || isLoading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sharing...
                                            </>
                                        ) : (
                                            'Share Post'
                                        )}
                                    </button>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
