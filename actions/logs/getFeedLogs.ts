import { getFeedLogs } from '@/services/logs';
import type { EnhancedLog } from '@/types/types';

/**
 * Get feed logs for a user with pagination support
 */
export const getFeedLogsAction = async (
  profileId: string,
  blockedUserIds: string[] = [],
  limit: number = 10,
  offset: number = 0,
): Promise<EnhancedLog[]> => {
  return await getFeedLogs(profileId, blockedUserIds, limit, offset);
};
