import { supabase } from '@/lib/supabase';
import type { EnhancedLog } from '@/types/types';
import type { Recipe, Log, Log_Like, Log_Comment } from '@/types/db';

/**
 * Get feed logs for a user (includes followed users and own logs)
 */
export const getFeedLogs = async (
  profileId: string,
  blockedUserIds: string[] = [],
  limit: number = 10,
  offset: number = 0,
): Promise<EnhancedLog[]> => {
  // Get following IDs
  const { data: follows, error: followErr } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profileId);

  if (followErr) throw followErr;

  const followingIds = [...(follows?.map((f) => f.following_id) ?? []), profileId];

  // Build logs query
  let logsQuery = supabase
    .from('logs')
    .select(
      `
      *,
      profile:profiles(*),
      recipe:recipes(*)
    `,
    )
    .in('profile_id', followingIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Filter out blocked users
  if (blockedUserIds.length > 0) {
    logsQuery = logsQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }

  const { data: logs, error: logErr } = await logsQuery;
  if (logErr) throw logErr;
  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((log) => log.id);

  // Get likes for these logs
  let likesQuery = supabase.from('log_likes').select('*').in('log_id', logIds);
  if (blockedUserIds.length > 0) {
    likesQuery = likesQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }
  const { data: likes, error: likesErr } = await likesQuery;
  if (likesErr) throw likesErr;

  // Get comments for these logs
  let commentsQuery = supabase.from('log_comments').select('*').in('log_id', logIds);
  if (blockedUserIds.length > 0) {
    commentsQuery = commentsQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }
  const { data: comments, error: commentsError } = await commentsQuery;
  if (commentsError) throw commentsError;

  // Combine logs with their likes and comments
  const logsWithData = logs.map((log) => ({
    ...log,
    recipe: log.recipe as Recipe,
    likes: likes?.filter((like) => like.log_id === log.id) ?? [],
    comments: comments?.filter((comment) => comment.log_id === log.id) ?? [],
  }));

  return logsWithData as EnhancedLog[];
};

/**
 * Get profile logs for a specific user
 */
export const getProfileLogs = async (
  profileId: string,
  limit: number = 10,
  offset: number = 0,
): Promise<EnhancedLog[]> => {
  // Get logs for the profile
  const { data: logs, error: logErr } = await supabase
    .from('logs')
    .select(
      `
      *,
      profile:profiles(*),
      recipe:recipes(*)
    `,
    )
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (logErr) throw logErr;
  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((log) => log.id);

  // Get likes for these logs
  const { data: likes, error: likesErr } = await supabase
    .from('log_likes')
    .select('*')
    .in('log_id', logIds);
  if (likesErr) throw likesErr;

  // Get comments for these logs
  const { data: comments, error: commentsError } = await supabase
    .from('log_comments')
    .select('*')
    .in('log_id', logIds);
  if (commentsError) throw commentsError;

  // Combine logs with their likes and comments
  const logsWithData = logs.map((log) => ({
    ...log,
    recipe: log.recipe as Recipe,
    likes: likes?.filter((like) => like.log_id === log.id) ?? [],
    comments: comments?.filter((comment) => comment.log_id === log.id) ?? [],
  }));

  return logsWithData as EnhancedLog[];
};

/**
 * Get recent logs from the most active users (for empty feed discovery)
 */
export const getRecentLogsFromActiveUsers = async (
  currentUserId: string,
  blockedUserIds: string[] = [],
  limit: number = 20,
): Promise<EnhancedLog[]> => {
  // First, get the top 10 most active users (excluding current user and blocked users)
  let activeUsersQuery = supabase
    .from('profiles_with_log_count')
    .select('id')
    .neq('id', currentUserId)
    .gt('log_count', 0)
    .order('log_count', { ascending: false })
    .limit(10);

  if (blockedUserIds.length > 0) {
    activeUsersQuery = activeUsersQuery.not('id', 'in', `(${blockedUserIds.join(',')})`);
  }

  const { data: activeUsers, error: activeUsersErr } = await activeUsersQuery;
  if (activeUsersErr) throw activeUsersErr;
  if (!activeUsers || activeUsers.length === 0) return [];

  const activeUserIds = activeUsers.map((user) => user.id);

  // Get recent logs from these active users
  let logsQuery = supabase
    .from('logs')
    .select(
      `
      *,
      profile:profiles(*),
      recipe:recipes(*)
    `,
    )
    .in('profile_id', activeUserIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter out blocked users from logs as well
  if (blockedUserIds.length > 0) {
    logsQuery = logsQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }

  const { data: logs, error: logErr } = await logsQuery;
  if (logErr) throw logErr;
  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((log) => log.id);

  // Get likes for these logs (excluding blocked users)
  let likesQuery = supabase.from('log_likes').select('*').in('log_id', logIds);
  if (blockedUserIds.length > 0) {
    likesQuery = likesQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }
  const { data: likes, error: likesErr } = await likesQuery;
  if (likesErr) throw likesErr;

  // Get comments for these logs (excluding blocked users)
  let commentsQuery = supabase.from('log_comments').select('*').in('log_id', logIds);
  if (blockedUserIds.length > 0) {
    commentsQuery = commentsQuery.not('profile_id', 'in', `(${blockedUserIds.join(',')})`);
  }
  const { data: comments, error: commentsError } = await commentsQuery;
  if (commentsError) throw commentsError;

  // Combine logs with their likes and comments
  const logsWithData = logs.map((log) => ({
    ...log,
    recipe: log.recipe as Recipe,
    likes: likes?.filter((like) => like.log_id === log.id) ?? [],
    comments: comments?.filter((comment) => comment.log_id === log.id) ?? [],
  }));

  return logsWithData as EnhancedLog[];
};
