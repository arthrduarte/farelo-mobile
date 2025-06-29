import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Block } from '@/types/db';

export const useBlocks = (targetUserId?: string) => {
  const { profile: currentProfile } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Check if current user has blocked the target user or vice versa
  const checkBlockStatus = useCallback(async () => {
    if (!currentProfile || !targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .or(`and(blocker_id.eq.${currentProfile.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentProfile.id})`);

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking block status:', error);
        return;
      }

      setIsBlocked(!!data && data.length > 0);
    } catch (error) {
      console.error('Error checking block status:', error);
    } finally {
      setLoading(false);
    }
  }, [currentProfile, targetUserId]);

  // Get all users blocked by current user
  const fetchBlockedUsers = useCallback(async () => {
    if (!currentProfile) return;

    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', currentProfile.id);

      if (error) throw error;

      const blockedIds = data?.map(block => block.blocked_id) || [];
      setBlockedUsers(blockedIds);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  }, [currentProfile]);

  // Get all users who have blocked current user
  const fetchBlockingUsers = useCallback(async () => {
    if (!currentProfile) return [];

    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', currentProfile.id);

      if (error) throw error;

      return data?.map(block => block.blocker_id) || [];
    } catch (error) {
      console.error('Error fetching blocking users:', error);
      return [];
    }
  }, [currentProfile]);

  // Get all users involved in blocking (both directions)
  const getAllBlockedRelationships = useCallback(async () => {
    if (!currentProfile) return [];

    try {
      const [blockedByMe, blockingMe] = await Promise.all([
        fetchBlockedUsers(),
        fetchBlockingUsers()
      ]);

      // Combine both arrays and remove duplicates
      const allBlockedUsers = [...blockedUsers, ...await fetchBlockingUsers()];
      return [...new Set(allBlockedUsers)];
    } catch (error) {
      console.error('Error fetching all blocked relationships:', error);
      return [];
    }
  }, [currentProfile, blockedUsers, fetchBlockingUsers]);

  // Block a user
  const blockUser = async (userIdToBlock: string) => {
    if (!currentProfile || !userIdToBlock) return;

    try {
      setIsBlocking(true);

      // 1. Add block relationship
      const { error: blockError } = await supabase
        .from('blocks')
        .insert({
          blocker_id: currentProfile.id,
          blocked_id: userIdToBlock
        });

      if (blockError) throw blockError;

      // 2. Remove follow relationships (both directions)
      const { error: unfollowError1 } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentProfile.id)
        .eq('following_id', userIdToBlock);

      const { error: unfollowError2 } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userIdToBlock)
        .eq('following_id', currentProfile.id);

      if (unfollowError1) console.error('Error removing follow:', unfollowError1);
      if (unfollowError2) console.error('Error removing follower:', unfollowError2);

      setIsBlocked(true);
      await fetchBlockedUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    } finally {
      setIsBlocking(false);
    }
  };

  // Unblock a user
  const unblockUser = async (userIdToUnblock: string) => {
    if (!currentProfile || !userIdToUnblock) return;

    try {
      setIsBlocking(true);

      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('blocker_id', currentProfile.id)
        .eq('blocked_id', userIdToUnblock);

      if (error) throw error;

      setIsBlocked(false);
      await fetchBlockedUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    } finally {
      setIsBlocking(false);
    }
  };

  // Check if a specific user is blocked (utility function)
  const isUserBlocked = useCallback((userId: string) => {
    if (!currentProfile) return false;
    return blockedUsers.includes(userId);
  }, [currentProfile, blockedUsers]);

  useEffect(() => {
    if (targetUserId) {
      checkBlockStatus();
    }
    fetchBlockedUsers();
  }, [checkBlockStatus, fetchBlockedUsers, targetUserId]);

  return {
    isBlocked,
    loading,
    isBlocking,
    blockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked,
    getAllBlockedRelationships,
    refetch: checkBlockStatus
  };
}; 