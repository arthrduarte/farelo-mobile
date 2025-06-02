import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';

export const useFollowers = (profileId: string) => {
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      // Get all followers for this profile
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select(`
                    follower_id,
                    profiles!follows_follower_id_fkey(*)
                `)
        .eq('following_id', profileId);

      if (followError) throw followError;

      // Extract the profile data from the join
      const followerProfiles = followData?.map(follow => follow.profiles).filter(Boolean) || [];
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
    refetch: fetchFollowers
  };
}; 