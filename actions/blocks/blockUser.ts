import { createBlock } from '@/services/blocks';
import { deleteFollow } from '@/services/follows';

/**
 * Block a user and handle all related side effects
 * - Creates block record
 * - Removes any existing follow relationships in both directions
 */
export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  // Create the block
  await createBlock(blockerId, blockedId);

  // Remove any existing follow relationships
  await Promise.all([
    deleteFollow(blockerId, blockedId), // Unfollow blocked user
    deleteFollow(blockedId, blockerId), // Remove blocked user's follow
  ]);
};
