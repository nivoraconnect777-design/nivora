import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Send, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '../../types/post';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import InlineComments from '../post/InlineComments';

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onDelete }: PostCardProps) {
    const { user } = useAuthStore();
    const isOwner = user?.id === post.userId;
    const [showHeart, setShowHeart] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleDoubleClick = () => {
        if (!post.isLiked) {
            onLike?.(post.id);
        }
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    const handleLikeClick = () => {
        onLike?.(post.id);
        if (!post.isLiked) {
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: `Post by ${post.user.username}`,
            text: post.caption || 'Check out this post on Nivora!',
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const toggleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Post unsaved' : 'Post saved');
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {post.user.profilePicUrl ? (
                            <img
                                src={post.user.profilePicUrl}
                                alt={post.user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {post.user.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline">
                            {post.user.username}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={() => onDelete?.(post.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Media */}
            <div
                className="relative bg-gray-100 dark:bg-gray-900 max-h-[600px] overflow-hidden cursor-pointer"
                onDoubleClick={handleDoubleClick}
            >
                {post.mediaType === 'video' ? (
                    <video
                        src={post.mediaUrl}
                        controls
                        className="w-full h-full object-contain mx-auto"
                        poster={post.thumbnailUrl || undefined}
                    />
                ) : (
                    <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Post content'}
                        className="w-full h-full object-contain mx-auto"
                    />
                )}

                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {showHeart && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Heart className="w-32 h-32 text-white fill-white drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLikeClick}
                            className={`flex items-center space-x-1 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'
                                }`}
                        >
                            <Heart
                                className={`w-6 h-6 ${post.isLiked ? 'fill-current drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`}
                            />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleComments}
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                        >
                            <Send className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleSave}
                        className={`text-gray-600 dark:text-gray-300 hover:text-yellow-500 transition-colors ${isSaved ? 'text-yellow-500' : ''}`}
                    >
                        <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                    </motion.button>
                </div>

                {/* Likes Count */}
                {post.likesCount > 0 && (
                    <div className="mb-2 font-semibold text-gray-900 dark:text-white">
                        {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
                    </div>
                )}

                {/* Caption */}
                {post.caption && (
                    <div className="mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                            {post.user.username}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{post.caption}</span>
                    </div>
                )}

                {/* Comments Link */}
                {post.commentsCount > 0 && (
                    <button
                        onClick={toggleComments}
                        className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
                    >
                        {showComments ? 'Hide comments' : `View all ${post.commentsCount} comments`}
                    </button>
                )}
            </div>

            {/* Inline Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <InlineComments postId={post.id} isOpen={showComments} />
                )}
            </AnimatePresence>
        </div>
    );
}
