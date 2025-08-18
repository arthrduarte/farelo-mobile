import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleLike } from './useToggleLike';

type UseLogLikesProps = {
  initialIsLiked: boolean;
  initialLikeCount: number;
  logId: string;
};

export const useLogLikes = ({ initialIsLiked, initialLikeCount, logId }: UseLogLikesProps) => {
  const { profile } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const { mutate: toggleLikeMutation } = useToggleLike();

  // Effect to sync state with props if they change after initial mount
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikeCount(initialLikeCount);
  }, [initialIsLiked, initialLikeCount]);

  const toggleLike = useCallback(async () => {
    if (!profile) {
      console.error('Cannot like/unlike without a profile');
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);

    try {
      toggleLikeMutation(logId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    }
  }, [isLiked, likeCount, toggleLikeMutation, logId, profile]);

  return {
    isLiked,
    likeCount,
    toggleLike,
  };
};
