import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/db';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get all notifications for a user
export const getNotifications = async (profile_id: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profile_id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Mark notification as read
export const markNotificationAsRead = async (notification_id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notification_id);

  if (error) throw error;
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

export const savePushToken = async (profile_id: string): Promise<void> => {
  console.log("Starting savePushToken");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log("Existing status:", existingStatus);
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log("New status:", status);
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;
  console.log("Final status:", finalStatus);

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    console.warn("No EAS projectId found. Make sure your app is registered with EAS.");
    return;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Token:", token);

    if (!profile_id) return;

    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", profile_id);

    console.log("Update complete");
  } catch (err) {
    console.error("Failed to get Expo push token:", err);
  }

}