import { useQuery } from '@tanstack/react-query';
import { getRecentLogsFromActiveUsersAction } from '@/actions/logs/getRecentLogsFromActiveUsers';
import { LOG_KEYS } from './queryKeys';
import { useGetAllBlockedIds } from '../blocks/useGetAllBlockedIds';
import type { EnhancedLog } from '@/types/types';

export const useRecentLogsFromActiveUsers = (currentUserId: string | undefined) => {
  const { data: blockedUserIds = [] } = useGetAllBlockedIds();

  return useQuery<EnhancedLog[], Error>({
    queryKey: LOG_KEYS.recentFromActiveUsers(currentUserId),
    queryFn: () => getRecentLogsFromActiveUsersAction(currentUserId!, blockedUserIds, 20),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 10, // 10 minutes - discovery content can be cached longer
    retry: 2,
  });
};
