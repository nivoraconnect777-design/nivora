import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from '../../types/post';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface CommentItemProps {
    comment: Comment;
    postId: string;
    onReply: (username: string, commentId: string) => void;
    depth?: number;
}

export default function CommentItem({ comment, postId, onReply, depth = 0 }: CommentItemProps) {
    const { user } = useAuthStore();
    const [isLiked, setIsLiked] = useState(comment.isLiked);
    const [likesCount, setLikesCount] = useState(comment.likesCount);
    const [showReplies, setShowReplies] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    const handleLike = async () => {
        if (isLiking) return;

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
        setIsLiking(true);

        try {
            await api.post(`/api/posts/comments/${comment.id}/like`);
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
            console.error('Failed to like comment:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleReply = () => {
        onReply(comment.user.username, comment.id);
    };

    return (
        <div className={`flex gap-3 ${depth > 0 ? 'mt-3' : 'mt-4'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer hover:opacity-80">
                    {comment.user.profilePicUrl ? (
                        <img src={comment.user.profilePicUrl} alt={comment.user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {comment.user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white cursor-pointer hover:underline">
                        {comment.user.username}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {comment.text}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 font-medium">
                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>

                    {likesCount > 0 && (
                        <span className="font-semibold text-gray-900 dark:text-white">{likesCount} likes</span>
                    )}

                    <button
                        onClick={handleReply}
                        className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    >
                        Reply
                    </button>
                </div>

                {/* Nested Replies Toggle */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                        >
                            <div className="w-6 h-[1px] bg-gray-300 dark:bg-gray-700"></div>
                            {showReplies ? 'Hide replies' : `View ${comment.replies.length} replies`}
                        </button>
                    </div>
                )}

                {/* Nested Replies List */}
                <AnimatePresence>
                    {showReplies && comment.replies && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    onReply={onReply}
                                    depth={depth + 1}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Like Button */}
            <button
                onClick={handleLike}
                className="flex-shrink-0 pt-1 group"
            >
                <Heart
                    className={`w-3 h-3 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
            </button>
        </div>
    );
}
