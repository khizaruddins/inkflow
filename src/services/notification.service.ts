import { apiClient } from '@/lib/api-client';
import { NotificationItem } from '@/store/use-notification-store';

export const NotificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const rawList = await apiClient.get<any[]>('/notifications');
      if (Array.isArray(rawList)) {
        return rawList.map((raw) => ({
          id: raw.id || raw._id,
          type: (raw.type || 'follow').toLowerCase(),
          actorName: raw.actorName || 'InkFlow User',
          actorAvatar:
            raw.actorAvatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          targetTitle: raw.targetTitle,
          targetSlug: raw.targetSlug,
          timestamp: raw.timestamp || 'Just now',
          isRead: Boolean(raw.isRead ?? raw.read),
          metaText: raw.metaText || 'interacted with your profile',
        }));
      }
      return [];
    } catch (err: any) {
      if (err?.status !== 401 && err?.response?.status !== 401) {
        console.error('Error fetching notifications from backend:', err);
      }
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      return true;
    } catch (err) {
      console.error(`Error marking notification ${id} as read:`, err);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await apiClient.patch('/notifications/read-all');
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  },
};
