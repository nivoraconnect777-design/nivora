import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

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
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        markNotificationsAsRead();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/notifications', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            await fetch('http://localhost:5000/api/notifications/read', {
                method: 'PUT',
                credentials: 'include',
            });
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
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold mb-6">Notifications</h1>

                {notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${!notification.isRead ? 'bg-gray-900' : 'hover:bg-gray-900/50'
                                    }`}
                            >
                                {/* Actor Profile Picture */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={notification.actor.profilePicUrl || '/default-avatar.png'}
                                        alt={notification.actor.username}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                                    />
                                </div>

                                {/* Notification Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-semibold">{notification.actor.username}</span>
                                        {' '}
                                        <span className="text-gray-400">{getNotificationText(notification)}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {getTimeAgo(notification.createdAt)}
                                    </p>
                                </div>

                                {/* Post Thumbnail (if applicable) */}
                                {notification.post && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={notification.post.thumbnailUrl || notification.post.mediaUrl}
                                            alt="Post"
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                    </div>
                                )}

                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
