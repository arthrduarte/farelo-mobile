import { markNotificationAsRead } from '@/services/notifications';
import type { Notification } from '@/types/db';

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<Notification> => {
  return await markNotificationAsRead(notificationId);
};
