import { markNotificationAsRead } from '@/services/notifications';

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  await markNotificationAsRead(notificationId);
};
