import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useFollow = (profileId: string) => {
    const { profile: currentProfile } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        if (!profileId) return;

        const fetchCounts = async () => {
            try {
                // Get followers count
                const [followersResult, followingResult] = await Promise.all([
                    supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profileId),
                    supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', profileId)
                ]);

                if (followersResult.error) throw followersResult.error;
                if (followingResult.error) throw followingResult.error;

                setFollowersCount(followersResult.count || 0);
                setFollowingCount(followingResult.count || 0);
            } catch (error) {
                console.error('Error fetching follow counts:', error);
            }
        };

        fetchCounts();
    }, [profileId, isFollowing]); // Re-fetch when isFollowing changes

    useEffect(() => {
        if (!currentProfile || !profileId) return;

        const checkFollowStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('follows')
                    .select('*')
                    .eq('follower_id', currentProfile.id)
                    .eq('following_id', profileId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error checking follow status:', error);
                }

                setIsFollowing(!!data);
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkFollowStatus();
    }, [currentProfile, profileId]);

    const toggleFollow = async () => {
        if (!currentProfile || !profileId) return;

        try {
            setLoading(true);
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', currentProfile.id)
                    .eq('following_id', profileId);

                if (error) throw error;
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1); // Decrement followers count
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({
                        follower_id: currentProfile.id,
                        following_id: profileId
                    });

                if (error) throw error;
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1); // Increment followers count
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        isFollowing,
        loading,
        toggleFollow,
        followersCount,
        followingCount
    };
}; 