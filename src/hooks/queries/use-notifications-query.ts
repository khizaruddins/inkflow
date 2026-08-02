import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/notification.service';
import { NotificationItem } from '@/store/use-notification-store';
import { useAuthStore } from '@/store/use-auth-store';

export function useNotificationsQuery() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    enabled: isAuthenticated,
    queryFn: async () => {
      return NotificationService.getNotifications();
    },
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      return NotificationService.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, void>({
    mutationFn: async () => {
      return NotificationService.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
