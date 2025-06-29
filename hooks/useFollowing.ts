import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';
import { useBlocks } from './useBlocks';

export const useFollowing = (profileId: string) => {
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllBlockedRelationships } = useBlocks();

  const fetchFollowing = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Get blocked users to filter out
      const blockedUserIds = await getAllBlockedRelationships();

      // Get all users that this profile is following
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select(`
                    following_id,
                    profiles!follows_following_id_fkey(*)
                `)
        .eq('follower_id', profileId);

      if (followError) throw followError;

      // Extract the profile data from the join and filter out blocked users
      const followingProfiles = followData?.map(follow => follow.profiles).filter(profile =>
        profile && !blockedUserIds.includes(profile.id)
      ) || [];
      setFollowing(followingProfiles as unknown as Profile[]);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch following');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, [profileId]);

  return {
    following,
    loading,
    error,
    refetch: fetchFollowing
  };
}; 