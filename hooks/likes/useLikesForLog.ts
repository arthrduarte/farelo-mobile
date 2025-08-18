import { useQuery } from '@tanstack/react-query';
import { getLikesForLog } from '@/actions/likes/getLikesForLog';
import { LIKES_KEYS } from './queryKeys';

export const useLikesForLog = (logId: string) => {
  return useQuery({
    queryKey: LIKES_KEYS.list(logId),
    queryFn: () => getLikesForLog(logId),
    enabled: !!logId,
  });
};
