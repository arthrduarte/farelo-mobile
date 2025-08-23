import { getRecentLogsFromActiveUsers } from '@/services/logs';
import type { EnhancedLog } from '@/types/types';

/**
 * Get recent logs from the most active users for discovery feed
 */
export const getRecentLogsFromActiveUsersAction = async (
  currentUserId: string,
  blockedUserIds: string[] = [],
  limit: number = 20,
): Promise<EnhancedLog[]> => {
  return await getRecentLogsFromActiveUsers(currentUserId, blockedUserIds, limit);
};
