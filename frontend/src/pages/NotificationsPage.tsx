import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Notification {
    id: string;
    type: string;
    postId?: string;
    reelId?: string;
    commentId?: string;
    actor: {
        id: string;
        username: string;
        profilePicUrl: string | null;
    };
    post?: {
        mediaUrl: string;
        thumbnailUrl: string | null;
    };
    comment?: {
        text: string;
        postId: string;
    };
    isRead: boolean;
    createdAt: string;
}

const NotificationsPage = () => {
    const { isDark } = useThemeStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
    const [commentLikes, setCommentLikes] = useState<Record<string, { isLiked: boolean; count: number }>>({});
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        fetchNotifications();
        markNotificationsAsRead();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications');
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            await api.put('/api/notifications/read');
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
        // If clicking on a comment notification, expand it instead of navigating
        if (notification.type === 'comment' && notification.commentId) {
            e.stopPropagation();
            setExpandedCommentId(expandedCommentId === notification.commentId ? null : notification.commentId);
        } else {
            // Navigate to the post for other notification types
            if (notification.postId) {
                navigate(`/post/${notification.postId}`);
            } else if (notification.comment?.postId) {
                navigate(`/post/${notification.comment.postId}`);
            }
        }
    };

    const handleThumbnailClick = (notification: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (notification.postId) {
            navigate(`/post/${notification.postId}`);
        } else if (notification.comment?.postId) {
            navigate(`/post/${notification.comment.postId}`);
        }
    };

    const handleUsernameClick = (username: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/profile/${username}`);
    };

    const handleCommentLike = async (commentId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic update
        const currentState = commentLikes[commentId] || { isLiked: false, count: 0 };
        const newIsLiked = !currentState.isLiked;
        setCommentLikes(prev => ({
            ...prev,
            [commentId]: {
                isLiked: newIsLiked,
                count: currentState.count + (newIsLiked ? 1 : -1)
            }
        }));

        try {
            await api.post(`/api/posts/comments/${commentId}/like`);
        } catch (error) {
            // Revert on error
            setCommentLikes(prev => ({
                ...prev,
                [commentId]: currentState
            }));
            toast.error('Failed to like comment');
        }
    };

    const handleReplySubmit = async (notification: Notification, e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!replyText.trim() || !notification.comment?.postId) return;

        setIsSubmittingReply(true);
        try {
            await api.post(`/api/posts/${notification.comment.postId}/comments`, {
                text: replyText,
                parentCommentId: notification.commentId
            });
            toast.success('Reply posted!');
            setReplyText('');
            setExpandedCommentId(null);
        } catch (error) {
            console.error('Failed to post reply:', error);
            toast.error('Failed to post reply');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return 'liked your photo';
            case 'comment':
                return notification.comment
                    ? `commented: ${notification.comment.text.substring(0, 50)}${notification.comment.text.length > 50 ? '...' : ''}`
                    : 'commented on your photo';
            case 'follow':
                return 'started following you';
            default:
                return 'interacted with your content';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
        return `${Math.floor(seconds / 604800)}w`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto px-4 py-6 md:max-w-2xl">
            <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
            </h1>

            {notifications.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {notifications.map((notification) => {
                        const isExpanded = expandedCommentId === notification.commentId;
                        const commentLikeState = notification.commentId ? commentLikes[notification.commentId] : null;

                        return (
                            <div
                                key={notification.id}
                                className={`rounded-xl transition-colors ${!notification.isRead
                                    ? (isDark ? 'bg-gray-800/50' : 'bg-blue-50')
                                    : ''
                                    }`}
                            >
                                <div
                                    onClick={(e) => handleNotificationClick(notification, e)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {/* Actor Profile Picture */}
                                    <div
                                        className="flex-shrink-0 cursor-pointer"
                                        onClick={(e) => handleUsernameClick(notification.actor.username, e)}
                                    >
                                        <img
                                            src={notification.actor.profilePicUrl || '/default-avatar.png'}
                                            alt={notification.actor.username}
                                            className={`w-12 h-12 rounded-full object-cover border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                        />
                                    </div>

                                    {/* Notification Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            <span
                                                className="font-semibold hover:underline cursor-pointer"
                                                onClick={(e) => handleUsernameClick(notification.actor.username, e)}
                                            >
                                                {notification.actor.username}
                                            </span>
                                            {' '}
                                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                {getNotificationText(notification)}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                            {notification.type === 'comment' && notification.commentId && (
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        {isExpanded ? 'Tap to collapse' : 'Tap to like/reply'}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Post Thumbnail (if applicable) */}
                                    {notification.post && (
                                        <div
                                            className="flex-shrink-0 cursor-pointer"
                                            onClick={(e) => handleThumbnailClick(notification, e)}
                                        >
                                            <img
                                                src={notification.post.thumbnailUrl || notification.post.mediaUrl}
                                                alt="Post"
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Comment Section */}
                                <AnimatePresence>
                                    {isExpanded && notification.comment && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`px-3 pb-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                                {/* Full Comment Text */}
                                                <div className="mt-3 mb-3">
                                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {notification.comment.text}
                                                    </p>
                                                </div>

                                                {/* Like and Reply Actions */}
                                                <div className="flex items-center gap-4 mb-3">
                                                    <button
                                                        onClick={(e) => notification.commentId && handleCommentLike(notification.commentId, e)}
                                                        className="flex items-center gap-1 text-sm group"
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 transition-colors ${commentLikeState?.isLiked
                                                                ? 'fill-red-500 text-red-500'
                                                                : `${isDark ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-500 group-hover:text-red-500'}`
                                                                }`}
                                                        />
                                                        {commentLikeState && commentLikeState.count > 0 && (
                                                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                                                {commentLikeState.count}
                                                            </span>
                                                        )}
                                                    </button>

                                                    <button className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>Reply</span>
                                                    </button>
                                                </div>

                                                {/* Reply Input */}
                                                <form onSubmit={(e) => handleReplySubmit(notification, e)} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write a reply..."
                                                        className={`flex-1 px-3 py-2 rounded-lg text-sm border ${isDark
                                                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!replyText.trim() || isSubmittingReply}
                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {isSubmittingReply ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
