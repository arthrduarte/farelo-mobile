import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const checkUsernameAvailability = async (username: string, currentUserId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', currentUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Error checking username availability');
  }

  return !data; // Returns true if username is available
};

export const uploadProfileImage = async (uri: string, userId: string) => {
  // Read the file content as base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine file type and name
  const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const contentType = `image/${fileExt}`;
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload the decoded base64 content
  const { error: uploadError } = await supabase.storage
    .from('avatar.images')
    .upload(fileName, decode(base64), { contentType });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatar.images').getPublicUrl(fileName);

  return publicUrl;
};

export const updateProfile = async (
  userId: string,
  profileData: {
    first_name: string;
    last_name: string | null;
    username: string;
    image?: string;
  },
) => {
  const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`);
  }
};
