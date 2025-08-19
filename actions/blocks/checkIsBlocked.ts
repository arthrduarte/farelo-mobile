import { isUserBlocked } from '@/services/blocks';

/**
 * Check if a user is blocked
 */
export const checkIsBlocked = async (blockerId: string, blockedId: string): Promise<boolean> => {
  return await isUserBlocked(blockerId, blockedId);
};
