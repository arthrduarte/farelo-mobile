import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';

export const useFollowing = (profileId: string) => {
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowing = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Get all users that this profile is following
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select(`
                    following_id,
                    profiles!follows_following_id_fkey(*)
                `)
        .eq('follower_id', profileId);

      if (followError) throw followError;

      // Extract the profile data from the join
      const followingProfiles = followData?.map(follow => follow.profiles).filter(Boolean) || [];
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