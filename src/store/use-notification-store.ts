import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  type: 'follow' | 'subscribe' | 'clap' | 'response' | 'reply';
  actorName: string;
  actorAvatar: string;
  targetTitle?: string;
  timestamp: string;
  isRead: boolean;
  metaText?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: () => number;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'follow',
    actorName: 'Fernando Arens',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Jul 6, 2026',
    isRead: false,
    metaText: 'followed you',
  },
  {
    id: 'notif_2',
    type: 'subscribe',
    actorName: 'Fernando Arens',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Jul 6, 2026',
    isRead: false,
    metaText: 'subscribed to get email notifications for your stories',
  },
  {
    id: 'notif_3',
    type: 'follow',
    actorName: 'Nusrat Jahan + 1 other',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Jul 1, 2026',
    isRead: false,
    metaText: 'followed you',
  },
  {
    id: 'notif_4',
    type: 'subscribe',
    actorName: 'Bar Mariam',
    actorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Jun 4, 2026',
    isRead: true,
    metaText: 'subscribed to get email notifications for your stories',
  },
  {
    id: 'notif_5',
    type: 'clap',
    actorName: 'Dcuber²',
    actorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    targetTitle: 'Javascript Interview Questions with Answers',
    timestamp: 'Mar 25, 2026',
    isRead: true,
    metaText: 'clapped for',
  },
  {
    id: 'notif_6',
    type: 'follow',
    actorName: 'Boornimaece',
    actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    timestamp: 'Feb 26, 2026',
    isRead: true,
    metaText: 'followed you',
  },
  {
    id: 'notif_7',
    type: 'response',
    actorName: 'Praveen Sirvi',
    actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    targetTitle: 'Javascript Interview Questions with Answers',
    timestamp: 'Feb 13, 2026',
    isRead: true,
    metaText: 'responded to',
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
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
