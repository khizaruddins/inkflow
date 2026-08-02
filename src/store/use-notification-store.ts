import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  type: 'follow' | 'subscribe' | 'clap' | 'response' | 'reply' | string;
  actorName: string;
  actorAvatar: string;
  targetTitle?: string;
  targetSlug?: string;
  timestamp: string;
  isRead: boolean;
  metaText?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  setNotifications: (list: NotificationItem[]) => void;
  unreadCount: () => number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
      markAllAsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
        });
      },
      markAsRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        });
      },
      addNotification: (item) => {
        const newItem: NotificationItem = {
          ...item,
          id: `notif_${Date.now()}`,
          timestamp: 'Just now',
          isRead: false,
        };
        set({ notifications: [newItem, ...get().notifications] });
      },
    }),
    {
      name: 'inkflow-notifications-storage',
    }
  )
);
