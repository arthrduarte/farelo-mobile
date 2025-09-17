import { markAllNotificationsAsRead } from '@/services/notifications';

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  return await markAllNotificationsAsRead(userId);
};
