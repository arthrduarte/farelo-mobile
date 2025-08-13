import { supabase } from '@/lib/supabase';

export const updateUserEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    throw new Error(error.message);
  }
};
