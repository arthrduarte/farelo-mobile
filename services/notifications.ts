import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/db';

// Get all notifications for a user
export const getNotifications = async (profile_id: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Mark notification as read
export const markNotificationAsRead = async (notification_id: string): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notification_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (profile_id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', profile_id)
    .eq('is_read', false);

  if (error) throw error;
};

// Create a new notification
export const createNotification = async (
  profile_id: string,
  type: string,
  payload: object,
): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      profile_id,
      type,
      payload,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get unread notification count
export const getUnreadNotificationCount = async (profile_id: string): Promise<number> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profile_id)
    .eq('is_read', false);

  if (error) throw error;
  return data?.length || 0;
};

// Delete a notification
export const deleteNotification = async (notification_id: string): Promise<void> => {
  const { error } = await supabase.from('notifications').delete().eq('id', notification_id);

  if (error) throw error;
};
