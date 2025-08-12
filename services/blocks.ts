import { supabase } from '@/lib/supabase';

export const createBlock = async (blocker_id: string, blocked_id: string) => {
  const { data, error } = await supabase.from('blocks').insert({
    blocker_id: blocker_id,
    blocked_id: blocked_id,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getBlockedIds = async (blocker_id: string) => {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', blocker_id);

  if (error) {
    throw error;
  }

  return data;
};

export const getBlockerIds = async (blocked_id: string) => {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocker_id')
    .eq('blocked_id', blocked_id);

  if (error) {
    throw error;
  }

  return data;
};

export const deleteBlock = async (blocker_id: string, blocked_id: string) => {
  const { data, error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blocker_id)
    .eq('blocked_id', blocked_id);

  if (error) {
    throw error;
  }

  return data;
};
