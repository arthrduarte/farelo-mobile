import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toggleLike } from '@/actions/likes/toggleLike';
import { LIKES_KEYS } from './queryKeys';

export const useToggleLike = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => toggleLike(logId, profile!.id),
    onSuccess: (newLikeStatus, logId) => {
      // Invalidate likes list for this log
      queryClient.invalidateQueries({ queryKey: LIKES_KEYS.list(logId) });

      // Update the specific like status in cache
      queryClient.setQueryData(LIKES_KEYS.detail(logId, profile!.id), newLikeStatus);
    },
  });
};
