import { getAllBlockedIds as getAllBlockedIdsService } from '@/services/blocks';

/**
 * Get all user IDs that are either blocked by or blocking the given user
 */
export const getAllBlockedIds = async (profile_id: string): Promise<string[]> => {
  return await getAllBlockedIdsService(profile_id);
};
