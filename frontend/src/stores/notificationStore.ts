import { create } from 'zustand';
import api from '../lib/api';

interface NotificationState {
    unreadCount: number;
    lastNotification: any | null; // For pop-up
    fetchUnreadCount: () => Promise<void>;
    incrementUnreadCount: () => void;
    resetUnreadCount: () => void;
    setLastNotification: (notification: any) => void;
    clearLastNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    lastNotification: null,

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

    setLastNotification: (notification) => set({ lastNotification: notification }),
    clearLastNotification: () => set({ lastNotification: null }),
}));
