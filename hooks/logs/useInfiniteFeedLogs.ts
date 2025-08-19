import { useInfiniteQuery } from '@tanstack/react-query';
import { getFeedLogsAction } from '@/actions/logs/getFeedLogs';
import { LOG_KEYS } from './queryKeys';
import { useGetAllBlockedIds } from '../blocks/useGetAllBlockedIds';
import type { EnhancedLog } from '@/types/types';

const PAGE_SIZE = 10;

export const useInfiniteFeedLogs = (profileId: string | undefined) => {
  const { data: blockedUserIds = [] } = useGetAllBlockedIds();

  return useInfiniteQuery<EnhancedLog[], Error>({
    queryKey: LOG_KEYS.infiniteFeed(profileId),
    queryFn: ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * PAGE_SIZE;
      return getFeedLogsAction(profileId!, blockedUserIds, PAGE_SIZE, offset);
    },
    enabled: !!profileId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};
