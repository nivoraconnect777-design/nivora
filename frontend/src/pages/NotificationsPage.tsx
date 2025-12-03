import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../lib/api';

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

    const handleNotificationClick = (notification: Notification) => {
        // Navigate to the post
        if (notification.postId) {
            navigate(`/post/${notification.postId}`);
        } else if (notification.comment?.postId) {
            navigate(`/post/${notification.comment.postId}`);
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
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${!notification.isRead
                                    ? (isDark ? 'bg-gray-800/50' : 'bg-blue-50')
                                    : (isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50')
                                }`}
                        >
                            {/* Actor Profile Picture */}
                            <div className="flex-shrink-0">
                                <img
                                    src={notification.actor.profilePicUrl || '/default-avatar.png'}
                                    alt={notification.actor.username}
                                    className={`w-12 h-12 rounded-full object-cover border-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                />
                            </div>

                            {/* Notification Text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                    <span className="font-semibold">{notification.actor.username}</span>
                                    {' '}
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                        {getNotificationText(notification)}
                                    </span>
                                </p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {getTimeAgo(notification.createdAt)}
                                </p>
                            </div>

                            {/* Post Thumbnail (if applicable) */}
                            {notification.post && (
                                <div className="flex-shrink-0">
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
