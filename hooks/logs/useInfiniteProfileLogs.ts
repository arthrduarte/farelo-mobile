import { useInfiniteQuery } from '@tanstack/react-query';
import { getProfileLogsAction } from '@/actions/logs/getProfileLogs';
import { LOG_KEYS } from './queryKeys';
import type { EnhancedLog } from '@/types/types';

const PAGE_SIZE = 10;

export const useInfiniteProfileLogs = (profileId: string | undefined) => {
  return useInfiniteQuery<EnhancedLog[], Error>({
    queryKey: LOG_KEYS.infiniteProfile(profileId),
    queryFn: ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * PAGE_SIZE;
      return getProfileLogsAction(profileId!, PAGE_SIZE, offset);
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
