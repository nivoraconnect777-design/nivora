import { create } from 'zustand';
import api from '../lib/api';

interface NotificationState {
    unreadCount: number;
    lastNotification: any | null; // For pop-up
    notificationCounts: {
        like: number;
        comment: number;
    };
    fetchUnreadCount: () => Promise<void>;
    incrementUnreadCount: () => void;
    resetUnreadCount: () => void;
    setLastNotification: (notification: any) => void;
    clearLastNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    lastNotification: null,
    notificationCounts: {
        like: 0,
        comment: 0,
    },

    fetchUnreadCount: async () => {
        try {
            const response = await api.get('/api/notifications/unread-count');
            if (response.data.success) {
                set({ unreadCount: response.data.count });
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    },

    incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    resetUnreadCount: () => set({ unreadCount: 0 }),

    setLastNotification: (notification) => set((state) => {
        const type = notification.type as 'like' | 'comment';
        // Only track likes and comments for pop-up counts
        if (type !== 'like' && type !== 'comment') {
            return { lastNotification: notification };
        }

        return {
            lastNotification: notification,
            notificationCounts: {
                ...state.notificationCounts,
                [type]: (state.notificationCounts[type] || 0) + 1
            }
        };
    }),

    clearLastNotification: () => set({
        lastNotification: null,
        notificationCounts: { like: 0, comment: 0 }
    }),
}));
