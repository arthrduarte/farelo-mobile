import { getBlockedUsers } from '@/services/blocks';
import type { Profile } from '@/types/db';

/**
 * Get all blocked users with their profile information
 */
export const getAllBlockedUsers = async (userId: string): Promise<Profile[]> => {
  return await getBlockedUsers(userId);
};
