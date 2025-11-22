import React, { useState, useRef } from 'react';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user } = useAuthStore();
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mediaPreview) return;

        setIsLoading(true);
        try {
            // In a real app, we would upload the file to a storage service (S3, Cloudinary)
            // and get a URL back. For now, we'll send the base64 string directly
            // or assume the backend handles it (which our current controller expects mediaUrl).
            // Since we are using base64 for now as a simple implementation:

            await api.post('/posts', {
                caption,
                mediaUrl: mediaPreview, // Sending base64 as URL for simplicity in this demo
                mediaType,
            });

            setCaption('');
            clearMedia();
            onPostCreated?.();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
            <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {user?.profilePicUrl ? (
                        <img
                            src={user.profilePicUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder={`What's on your mind, ${user?.username}?`}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[80px]"
                        />

                        {mediaPreview && (
                            <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-900">
                                <button
                                    type="button"
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                {mediaType === 'video' ? (
                                    <video src={mediaPreview} controls className="max-h-96 w-full object-contain" />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" className="max-h-96 w-full object-contain" />
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Image className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium">Photo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Video className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium">Video</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!mediaPreview || isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
