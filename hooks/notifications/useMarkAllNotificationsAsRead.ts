import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllAsRead } from '@/actions/notifications/markAllNotificationsAsRead';
import { NOTIFICATION_KEYS } from './useGetNotifications';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/db';

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: () => markAllAsRead(profile!.id),
    onSuccess: () => {
      if (!profile?.id) return;

      // Update all notifications to read in the cache
      queryClient.setQueryData<Notification[]>(NOTIFICATION_KEYS.list(profile.id), (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((notification) => ({
          ...notification,
          is_read: true,
        }));
      });

      // Update unread count to 0
      queryClient.setQueryData<number>(NOTIFICATION_KEYS.unreadCount(profile.id), 0);
    },
  });
};
