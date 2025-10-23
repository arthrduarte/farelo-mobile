import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '@/actions/notifications/markNotificationAsRead';
import { NOTIFICATION_KEYS } from './useGetNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      if (!profile?.id) return;

      // Invalidate notifications list to refetch updated data
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.list(profile.id),
      });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.unreadCount(profile.id),
      });
    },
  });
};
