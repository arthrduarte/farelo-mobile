import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';
import { useGetAllBlockedIds } from './blocks/useGetAllBlockedIds';

export const useFollowers = (profileId: string) => {
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: blockedUserIds = [] } = useGetAllBlockedIds();

  const fetchFollowers = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Get all followers for this profile
      let query = supabase
        .from('follows')
        .select(
          `
                    follower_id,
                    profiles!follows_follower_id_fkey(*)
                `,
        )
        .eq('following_id', profileId);

      if (blockedUserIds.length > 0) {
        query = query.not('follower_id', 'in', `(${blockedUserIds.join(',')})`);
      }

      const { data: followData, error: followError } = await query;

      if (followError) throw followError;

      const followerProfiles = followData?.map((follow) => follow.profiles) || [];
      setFollowers(followerProfiles as unknown as Profile[]);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch followers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [profileId]);

  return {
    followers,
    loading,
    error,
    refetch: fetchFollowers,
  };
};
