import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, ZoomIn, ZoomOut, Loader2, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../stores/themeStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TextOverlay {
    id: string;
    text: string;
    xPct: number; // Percentage 0-100
    yPct: number; // Percentage 0-100
    fontSizePct: number; // Percentage of container width (e.g., 5 = 5%)
    color: string;
}

export default function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
    const queryClient = useQueryClient();
    const { isDark } = useThemeStore();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image manipulation states
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Text overlay states
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [activeTextId, setActiveTextId] = useState<string | null>(null);
    const [isAddingText, setIsAddingText] = useState(false);
    const [newText, setNewText] = useState('');

    // Emoji state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const imageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewText(prev => prev + emojiData.emoji);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Zoom handlers
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    // Pan/drag handlers for image
    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTextId) return; // Don't pan if editing text
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Touch handlers for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        if (activeTextId) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    // Text overlay handlers
    const handleAddText = () => {
        if (!newText.trim()) return;
        const newOverlay: TextOverlay = {
            id: Date.now().toString(),
            text: newText,
            xPct: 50,
            yPct: 50,
            fontSizePct: 8, // Default ~8% of screen width
            color: '#FFFFFF'
        };
        setTextOverlays([...textOverlays, newOverlay]);
        setNewText('');
        setIsAddingText(false);
        setActiveTextId(newOverlay.id);
        setShowEmojiPicker(false);
    };

    const handleTextDrag = (id: string, e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Calculate percentage position
        // Clamp between 0 and 100
        const xPct = Math.min(100, Math.max(0, ((clientX - containerRect.left) / containerRect.width) * 100));
        const yPct = Math.min(100, Math.max(0, ((clientY - containerRect.top) / containerRect.height) * 100));

        setTextOverlays(prev => prev.map(overlay =>
            overlay.id === id
                ? { ...overlay, xPct, yPct }
                : overlay
        ));
    };

    const handleTextSizeChange = (id: string, newSizePct: number) => {
        setTextOverlays(prev => prev.map(overlay =>
            overlay.id === id
                ? { ...overlay, fontSizePct: newSizePct }
                : overlay
        ));
    };


    const uploadToCloudinary = async (file: File): Promise<string> => {
        try {
            console.log('Getting upload signature for folder: stories');
            const signatureResponse = await api.post('/api/media/upload-signature', {
                folder: 'stories',
            });

            console.log('Signature response:', signatureResponse.data);

            const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data.data;

            if (!signature || !timestamp || !cloudName || !apiKey) {
                throw new Error('Invalid signature response from server');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', apiKey);
            formData.append('folder', folder);

            console.log('Uploading to Cloudinary:', cloudName, mediaType);

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType === 'video' ? 'video' : 'image'}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Cloudinary upload failed:', uploadResponse.status, errorText);
                throw new Error(`Cloudinary upload failed: ${uploadResponse.status} - ${errorText}`);
            }

            const data = await uploadResponse.json();
            console.log('Cloudinary upload successful:', data.secure_url);

            if (!data.secure_url) {
                throw new Error('No secure_url in Cloudinary response');
            }

            return data.secure_url;
        } catch (error: any) {
            console.error('Upload to Cloudinary error:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                throw new Error('Authentication required');
            }
            throw error;
        }
    };

    const renderToCanvas = async (): Promise<Blob> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            // Set canvas size to story dimensions (9:16 aspect ratio)
            canvas.width = 1080;
            canvas.height = 1920;

            const img = new Image();
            img.onload = () => {
                // Clear canvas
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate scaled dimensions
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const x = (canvas.width - scaledWidth) / 2 + position.x;
                const y = (canvas.height - scaledHeight) / 2 + position.y;

                // Draw image
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                // Draw text overlays
                textOverlays.forEach(overlay => {
                    const fontSize = (canvas.width * overlay.fontSizePct) / 100;
                    const x = (canvas.width * overlay.xPct) / 100;
                    const y = (canvas.height * overlay.yPct) / 100;

                    ctx.font = `bold ${fontSize}px Arial`;
                    ctx.fillStyle = overlay.color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Add simple shadow for better visibility
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    ctx.fillText(overlay.text, x, y);

                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                });

                canvas.toBlob((blob) => {
                    resolve(blob!);
                }, 'image/jpeg', 0.95);
            };
            img.src = previewUrl!;
        });
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);
        try {
            console.log('Starting story upload process...');
            let mediaUrl: string;

            if (mediaType === 'image' && (textOverlays.length > 0 || scale !== 1 || position.x !== 0 || position.y !== 0)) {
                console.log('Rendering edited image to canvas...');
                // Render edited image to canvas and upload
                const blob = await renderToCanvas();
                const editedFile = new File([blob], 'story.jpg', { type: 'image/jpeg' });
                mediaUrl = await uploadToCloudinary(editedFile);
            } else {
                console.log('Uploading original file...');
                // Upload original file
                mediaUrl = await uploadToCloudinary(file);
            }

            if (!mediaUrl) {
                throw new Error('Failed to get media URL from Cloudinary');
            }

            console.log('Creating story with mediaUrl:', mediaUrl);

            const response = await api.post('/api/stories', {
                mediaUrl,
                mediaType,
                duration: mediaType === 'video' ? 15000 : 5000,
            });

            console.log('Story created successfully:', response.data);

            toast.success('Story added!');
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            handleClose();
        } catch (error: any) {
            console.error('Upload story error:', error);

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
            } else if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.message || 'Invalid request';
                toast.error(`Upload failed: ${errorMsg}`);
            } else if (error.message?.includes('Authentication required')) {
                // Already shown toast in uploadToCloudinary
            } else {
                toast.error(error.message || 'Failed to upload story');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setTextOverlays([]);
        setActiveTextId(null);
        onClose();
    };


    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full h-full relative"
                >
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-white font-semibold text-lg">Create Story</h3>
                        <div className="w-10" />
                    </div>

                    {/* Main Content */}
                    {!previewUrl ? (
                        <div className="flex items-center justify-center h-full">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center cursor-pointer"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                                    <Type className="w-12 h-12 text-white" />
                                </div>
                                <p className="text-white text-lg font-medium">Add Photo or Video</p>
                                <p className="text-gray-400 text-sm mt-2">Max 10MB</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div
                            ref={containerRef}
                            className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
                            style={{ containerType: 'size' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleMouseUp}
                        >
                            {/* Image/Video Preview */}
                            <div
                                ref={imageRef}
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    cursor: isDragging ? 'grabbing' : 'grab'
                                }}
                                className="transition-transform"
                            >
                                {mediaType === 'video' ? (
                                    <video
                                        src={previewUrl}
                                        className="max-h-screen max-w-full"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-screen max-w-full select-none"
                                        draggable={false}
                                    />
                                )}
                            </div>

                            {/* Text Overlays */}
                            {textOverlays.map(overlay => (
                                <div
                                    key={overlay.id}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = 'move';
                                        setActiveTextId(overlay.id);
                                    }}
                                    onDrag={(e) => handleTextDrag(overlay.id, e)}
                                    onClick={() => setActiveTextId(overlay.id)}
                                    style={{
                                        position: 'absolute',
                                        left: `${overlay.xPct}%`,
                                        top: `${overlay.yPct}%`,
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: `${overlay.fontSizePct}cqw`, // Container Query Width relative units
                                        color: overlay.color,
                                        cursor: 'move',
                                        userSelect: 'none',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                        border: activeTextId === overlay.id ? '2px dashed white' : 'none',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap',
                                        zIndex: 20
                                    }}
                                    className="font-bold"
                                >
                                    {overlay.text}
                                </div>
                            ))}

                            {/* Text Size Slider (Visible when text is active) */}
                            {activeTextId && (
                                <div className="absolute left-4 right-4 bottom-28 z-30 bg-black/50 p-4 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-white text-xs font-bold">A-</span>
                                        <input
                                            type="range"
                                            min="2"
                                            max="20"
                                            step="0.5"
                                            value={textOverlays.find(t => t.id === activeTextId)?.fontSizePct || 8}
                                            onChange={(e) => handleTextSizeChange(activeTextId, parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                                        />
                                        <span className="text-white text-lg font-bold">A+</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Controls */}
                    {previewUrl && (
                        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex items-center justify-between mb-4">
                                {mediaType === 'image' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleZoomOut}
                                            className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60"
                                        >
                                            <ZoomOut className="w-5 h-5" />
                                        </button>
                                        <span className="text-white text-sm font-medium">{Math.round(scale * 100)}%</span>
                                        <button
                                            onClick={handleZoomIn}
                                            className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60"
                                        >
                                            <ZoomIn className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Text Button */}
                                <button
                                    onClick={() => setIsAddingText(true)}
                                    className="p-3 rounded-full bg-black/40 text-white hover:bg-black/60"
                                >
                                    <Type className="w-5 h-5" />
                                </button>

                                {/* Share Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isUploading}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sharing...
                                        </>
                                    ) : (
                                        'Share'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Text Modal */}
                    {isAddingText && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
                            <div className="bg-gray-900 rounded-2xl p-6 w-80">
                                <h4 className="text-white font-semibold mb-4">Add Text</h4>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        placeholder="Type something..."
                                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 outline-none mb-4 pr-10"
                                        autoFocus
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                                    />
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-full left-0 z-50">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                theme={isDark ? Theme.DARK : Theme.LIGHT}
                                                width={280}
                                                height={300}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsAddingText(false)}
                                        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddText}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );

    return ReactDOM.createPortal(modalContent, document.body);
}
