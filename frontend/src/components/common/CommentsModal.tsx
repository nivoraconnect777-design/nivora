import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Heart } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import { Comment } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded?: () => void;
}

export default function CommentsModal({ isOpen, onClose, postId, onCommentAdded }: CommentsModalProps) {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && postId) {
            fetchComments();
        }
    }, [isOpen, postId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/api/posts/${postId}/comments`);
            if (response.data.success) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await api.post(`/api/posts/${postId}/comments`, {
                text: newComment,
            });
            if (response.data.success) {
                setComments([response.data.comment, ...comments]);
                setNewComment('');
                onCommentAdded?.();
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = (username: string) => {
        setNewComment(`@${username} `);
        inputRef.current?.focus();
    };

    const toggleLike = (commentId: string) => {
        setLikedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comments</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <Send className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="font-medium">No comments yet</p>
                                    <p className="text-sm mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex space-x-3 group">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80">
                                            {comment.user.profilePicUrl ? (
                                                <img src={comment.user.profilePicUrl} alt={comment.user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {comment.user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white mr-2 cursor-pointer hover:underline">
                                                        {comment.user.username}
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleLike(comment.id)}
                                                    className={`transition-colors ${likedComments.has(comment.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                >
                                                    <Heart className={`w-3 h-3 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                            <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                                                <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                                <button
                                                    onClick={() => toggleLike(comment.id)}
                                                    className={`font-semibold transition-colors ${likedComments.has(comment.id) ? 'text-red-500' : 'hover:text-gray-900 dark:hover:text-gray-300'}`}
                                                >
                                                    Like
                                                </button>
                                                <button
                                                    onClick={() => handleReply(comment.user.username)}
                                                    className="font-semibold hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {user?.profilePicUrl ? (
                                        <img src={user.profilePicUrl} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full pl-4 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
