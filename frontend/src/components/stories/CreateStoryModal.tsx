import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Image as ImageIcon, Video } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
    const { isDark } = useThemeStore();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate size (10MB max)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const uploadToCloudinary = async (file: File): Promise<string> => {
        // Get signature
        const signatureResponse = await api.post('/api/media/upload-signature', {
            folder: 'stories',
        });

        const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data.data;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', folder);

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType === 'video' ? 'video' : 'image'}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await uploadResponse.json();
        return data.secure_url;
    };

    const handleSubmit = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const mediaUrl = await uploadToCloudinary(file);

            await api.post('/api/stories', {
                mediaUrl,
                mediaType,
                duration: mediaType === 'video' ? 15000 : 5000, // Default durations
            });

            toast.success('Story added!');
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            handleClose();
        } catch (error) {
            console.error('Upload story error:', error);
            toast.error('Failed to upload story');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-gray-900' : 'bg-white'
                                }`}
                        >
                            <div className="p-4 flex justify-between items-center border-b border-gray-700">
                                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Add to Story
                                </h3>
                                <button
                                    onClick={handleClose}
                                    className={`p-2 rounded-full hover:bg-gray-800 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col items-center min-h-[300px] justify-center">
                                {!previewUrl ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${isDark
                                                ? 'border-gray-700 hover:bg-gray-800'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Upload className={`w-12 h-12 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            Click to upload photo or video
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">Max 10MB</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                                        {mediaType === 'video' ? (
                                            <video
                                                src={previewUrl}
                                                className="w-full h-64 object-contain"
                                                controls
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-64 object-contain"
                                            />
                                        )}
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            <div className="p-4 border-t border-gray-700 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={!file || isUploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        'Share to Story'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
