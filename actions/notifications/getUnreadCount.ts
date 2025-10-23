import { getUnreadNotificationCount } from '@/services/notifications';

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return await getUnreadNotificationCount(userId);
};
