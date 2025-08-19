import { getLikesByLog } from '@/services/likes';
import { Profile } from '@/types/db';

/**
 * Get all users who liked a specific log
 * Returns profiles of users who liked the log
 */
export const getLikesForLog = async (logId: string): Promise<Profile[]> => {
  return await getLikesByLog(logId);
};
