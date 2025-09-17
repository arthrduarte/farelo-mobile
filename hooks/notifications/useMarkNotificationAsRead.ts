import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '@/actions/notifications/markNotificationAsRead';
import { NOTIFICATION_KEYS } from './useGetNotifications';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types/db';

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (updatedNotification: Notification) => {
      if (!profile?.id) return;

      // Update the notifications list
      queryClient.setQueryData<Notification[]>(NOTIFICATION_KEYS.list(profile.id), (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((notification) =>
          notification.id === updatedNotification.id ? updatedNotification : notification,
        );
      });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.unreadCount(profile.id),
      });
    },
  });
};
