import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import api from '../../lib/api';

interface CommentInputProps {
    postId: string;
    onCommentAdded: () => void;
    replyTo?: { username: string; commentId: string } | null;
    onCancelReply?: () => void;
}

export default function CommentInput({ postId, onCommentAdded, replyTo, onCancelReply }: CommentInputProps) {
    const { user } = useAuthStore();
    const { isDark } = useThemeStore();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
            setText(`@${replyTo.username} `);
        }
    }, [replyTo]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setText(prev => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            // Remove @username from text if replying
            const cleanText = replyTo ? text.replace(`@${replyTo.username} `, '') : text;

            await api.post(`/api/posts/${postId}/comments`, {
                text: cleanText,
                parentCommentId: replyTo?.commentId
            });

            setText('');
            setShowEmojiPicker(false);
            onCommentAdded();
            if (replyTo && onCancelReply) onCancelReply();
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
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
                {replyTo && (
                    <div className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700">
                        <span>Replying to {replyTo.username}</span>
                        <button
                            type="button"
                            onClick={() => {
                                setText('');
                                onCancelReply?.();
                            }}
                            className="hover:text-gray-900 dark:hover:text-gray-300"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Add a comment..."}
                    className={`w-full bg-white dark:bg-gray-800 border-none rounded-full pl-4 pr-20 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all shadow-sm ${replyTo ? 'rounded-tl-none' : ''}`}
                />

                {/* Emoji Picker Button */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${showEmojiPicker
                            ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                >
                    <Smile className="w-4 h-4" />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute right-0 bottom-full mb-2 z-50 shadow-2xl rounded-xl overflow-hidden">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={isDark ? Theme.DARK : Theme.LIGHT}
                            width={300}
                            height={400}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!text.trim() || isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </form>
    );
}
