import { supabase } from '@/lib/supabase';

// Get all followings for a profile
export const getFollowing = async (profile_id: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', profile_id);

  if (error) {
    throw error;
  }

  return data;
};

// Get all followers for a profile
export const getFollowers = async (profile_id: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profile_id);

  if (error) {
    throw error;
  }

  return data;
};
