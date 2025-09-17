import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAllNotifications } from '@/actions/notifications/getNotifications';
import type { Notification } from '@/types/db';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (userId: string) => [...NOTIFICATION_KEYS.lists(), userId] as const,
  unreadCount: (userId: string) => [...NOTIFICATION_KEYS.all, 'unreadCount', userId] as const,
};

export const useGetNotifications = () => {
  const { profile } = useAuth();

  return useQuery<Notification[]>({
    queryKey: NOTIFICATION_KEYS.list(profile?.id || ''),
    queryFn: () => getAllNotifications(profile!.id),
    enabled: !!profile?.id,
  });
};
