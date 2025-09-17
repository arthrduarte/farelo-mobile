import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/actions/notifications/getUnreadCount';
import { NOTIFICATION_KEYS } from './useGetNotifications';

export const useGetUnreadCount = () => {
  const { profile } = useAuth();

  return useQuery<number>({
    queryKey: NOTIFICATION_KEYS.unreadCount(profile?.id || ''),
    queryFn: () => getUnreadCount(profile!.id),
    enabled: !!profile?.id,
  });
};
