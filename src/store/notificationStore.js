import { create } from 'zustand';
import { notificationsApi } from '../services/api';
import { supabase } from '../services/supabaseClient';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await notificationsApi.list();
      set({ notifications: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationsApi.getUnreadCount();
      set({ unreadCount: data.count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: (userId) => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            notifications: [payload.new, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

export default useNotificationStore;
