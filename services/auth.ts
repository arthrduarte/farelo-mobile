import { supabase } from '@/lib/supabase';

export const updateUserEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const verifyCurrentPassword = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Current password is incorrect');
  }
};

export const updateUserPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};
