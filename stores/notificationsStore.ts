import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationsAPI } from '@/services/api';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getNotifications: (token: string) => Promise<void>;
  markAsRead: (token: string, notificationId: string) => Promise<void>;
  registerPushToken: (token: string, pushToken: string) => Promise<void>;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  getNotifications: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsAPI.getNotifications(token);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  markAsRead: async (token: string, notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(token, notificationId);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      });
    }
  },

  registerPushToken: async (token: string, pushToken: string) => {
    try {
      await notificationsAPI.registerPushToken(token, pushToken);
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  },

  clearError: () => set({ error: null }),
}));