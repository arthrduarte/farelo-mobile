import { deleteBlock } from '@/services/blocks';

/**
 * Unblock a user
 */
export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  await deleteBlock(blockerId, blockedId);
};
