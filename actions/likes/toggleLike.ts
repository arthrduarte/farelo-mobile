import { createLike, deleteLike, checkUserLiked } from '@/services/likes';

/**
 * Toggle like status for a log
 * - Checks current like status
 * - Adds like if not liked, removes if already liked
 */
export const toggleLike = async (logId: string, profileId: string): Promise<boolean> => {
  const isCurrentlyLiked = await checkUserLiked(logId, profileId);

  if (isCurrentlyLiked) {
    await deleteLike(logId, profileId);
    return false; // Now unliked
  } else {
    await createLike(logId, profileId);
    return true; // Now liked
  }
};
