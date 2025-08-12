import { supabase } from '@/lib/supabase';

export const createFollow = async (follower_id: string, following_id: string) => {
  const { data, error } = await supabase.from('follows').insert({
    follower_id: follower_id,
    following_id: following_id,
  });

  if (error) {
    throw error;
  }

  return data;
};

// Get all followings for a profile
export const getFollowings = async (profile_id: string) => {
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

export const deleteFollow = async (follower_id: string, following_id: string) => {
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', follower_id)
    .eq('following_id', following_id);

  if (error) {
    throw error;
  }

  return data;
};
