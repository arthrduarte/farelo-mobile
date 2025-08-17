import { getProfileLogs } from '@/services/logs';
import type { EnhancedLog } from '@/types/types';

/**
 * Get profile logs for a user with pagination support
 */
export const getProfileLogsAction = async (
  profileId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<EnhancedLog[]> => {
  return await getProfileLogs(profileId, limit, offset);
};
