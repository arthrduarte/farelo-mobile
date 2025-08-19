import { supabase } from '@/lib/supabase';
import { Log_Like, Profile } from '@/types/db';

// Create a new like
export const createLike = async (log_id: string, profile_id: string): Promise<Log_Like> => {
  const { data, error } = await supabase
    .from('log_likes')
    .insert({
      log_id,
      profile_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an existing like
export const deleteLike = async (log_id: string, profile_id: string): Promise<void> => {
  const { error } = await supabase
    .from('log_likes')
    .delete()
    .eq('log_id', log_id)
    .eq('profile_id', profile_id);

  if (error) throw error;
};

// Get all likes for a specific log with profile data
export const getLikesByLog = async (log_id: string): Promise<Profile[]> => {
  const { data: likes, error: likesError } = await supabase
    .from('log_likes')
    .select('profile_id')
    .eq('log_id', log_id);

  if (likesError) throw likesError;
  if (!likes.length) return [];

  const profileIds = likes.map((like) => like.profile_id);

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', profileIds);

  if (profilesError) throw profilesError;
  return profiles || [];
};

// Get like count for a specific log
export const getLikeCount = async (log_id: string): Promise<number> => {
  const { count, error } = await supabase
    .from('log_likes')
    .select('*', { count: 'exact', head: true })
    .eq('log_id', log_id);

  if (error) throw error;
  return count || 0;
};

// Check if a user has liked a specific log
export const checkUserLiked = async (log_id: string, profile_id: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('log_likes')
    .select('*')
    .eq('log_id', log_id)
    .eq('profile_id', profile_id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};
