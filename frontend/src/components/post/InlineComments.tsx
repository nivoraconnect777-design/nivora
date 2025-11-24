import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from '../../types/post';
import api from '../../lib/api';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface InlineCommentsProps {
    postId: string;
    isOpen: boolean;
}

export default function InlineComments({ postId, isOpen }: InlineCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [replyTo, setReplyTo] = useState<{ username: string; commentId: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
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

    const handleReply = (username: string, commentId: string) => {
        setReplyTo({ username, commentId });
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 dark:border-gray-800"
        >
            <div className="max-h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            postId={postId}
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>

            <CommentInput
                postId={postId}
                onCommentAdded={fetchComments}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
            />
        </motion.div>
    );
}
