import { getNotifications } from '@/services/notifications';
import type { Notification } from '@/types/db';

/**
 * Get all notifications for a user
 */
export const getAllNotifications = async (userId: string): Promise<Notification[]> => {
  return await getNotifications(userId);
};
