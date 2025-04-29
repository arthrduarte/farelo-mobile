import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type UseLikesProps = {
    initialIsLiked: boolean;
    initialLikeCount: number;
    logId: string;
};

export const useLikes = ({ initialIsLiked, initialLikeCount, logId }: UseLikesProps) => {
    const { profile } = useAuth();
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    // Effect to sync state with props if they change after initial mount
    useEffect(() => {
        setIsLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
    }, [initialIsLiked, initialLikeCount]);

    const addLike = useCallback(async () => {
        if (!profile) throw new Error("User not logged in");
        const { error } = await supabase
            .from('log_likes')
            .insert({ log_id: logId, profile_id: profile.id });
        if (error) throw error;
    }, [logId, profile]);

    const removeLike = useCallback(async () => {
        if (!profile) throw new Error("User not logged in");
        const { error } = await supabase
            .from('log_likes')
            .delete()
            .eq('log_id', logId)
            .eq('profile_id', profile.id);
        if (error) throw error;
    }, [logId, profile]);

    const toggleLike = useCallback(async () => {
        if (!profile) {
            console.error("Cannot like/unlike without a profile");
            return;
        }

        const previousIsLiked = isLiked;
        const previousLikeCount = likeCount;

        // Optimistic update
        setIsLiked(!previousIsLiked);
        setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);

        try {
            if (!previousIsLiked) {
                await addLike();
            } else {
                await removeLike();
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
            // Revert optimistic update on error
            setIsLiked(previousIsLiked);
            setLikeCount(previousLikeCount);
        }
    }, [isLiked, likeCount, addLike, removeLike, profile]);

    return {
        isLiked,
        likeCount,
        toggleLike,
    };
};
