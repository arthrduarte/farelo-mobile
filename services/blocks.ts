import { supabase } from '@/lib/supabase';
import { Block, Profile } from '@/types/db';

// Create a new block
export const createBlock = async (blocker_id: string, blocked_id: string): Promise<Block> => {
  const { data, error } = await supabase
    .from('blocks')
    .insert({
      blocker_id,
      blocked_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an existing block
export const deleteBlock = async (blocker_id: string, blocked_id: string): Promise<void> => {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blocker_id)
    .eq('blocked_id', blocked_id);

  if (error) throw error;
};

// Get all users blocked by a specific user
export const getBlockedUsers = async (blocker_id: string): Promise<Profile[]> => {
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', blocker_id);

  if (blocksError) throw blocksError;
  if (!blocks.length) return [];

  const blockedIds = blocks.map((block) => block.blocked_id);

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', blockedIds);

  if (profilesError) throw profilesError;
  return profiles || [];
};

// Check if a user is blocked
export const isUserBlocked = async (blocker_id: string, blocked_id: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('blocker_id', blocker_id)
    .eq('blocked_id', blocked_id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};
