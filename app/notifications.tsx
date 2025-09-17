import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { router } from 'expo-router';
import Avatar from '@/components/ui/Avatar';
import type { Notification } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsSkeletonLoader from '@/components/NotificationsSkeletonLoader';
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications';
import { useMarkNotificationAsRead } from '@/hooks/notifications/useMarkNotificationAsRead';
import { Colors } from '@/constants/Colors';

export default function NotificationsScreen() {
  const { profile } = useAuth();
  const { data: notifications, isLoading: isLoadingNotifications } = useGetNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Handle navigation based on notification type
    const payload = notification.payload as any;

    switch (notification.type) {
      case 'like':
        if (payload.log_id) {
          router.push({
            pathname: '/log/[logId]/details',
            params: { logId: payload.log_id },
          });
        }
        break;
      case 'comment':
        if (payload.log_id) {
          router.push({
            pathname: '/log/[logId]/comments',
            params: { logId: payload.log_id },
          });
        }
        break;
      case 'follow':
        if (payload.liker_profile_id) {
          router.push({
            pathname: '/profile/[id]',
            params: { id: payload.liker_profile_id },
          });
        }
        break;
      case 'recipe_share':
        if (payload.recipe_id) {
          router.push({
            pathname: '/recipe/[recipeId]/details',
            params: { recipeId: payload.recipe_id },
          });
        }
        break;
      default:
        break;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const payload = notification.payload as any;

    switch (notification.type) {
      case 'like':
        return `${payload.liker_name || 'Someone'} liked your ${payload.recipe_title} recipe!`;
      case 'comment':
        return `${payload.liker_name || 'Someone'} commented on your ${payload.recipe_title} recipe!`;
      case 'follow':
        return `${payload.liker_name || 'Someone'} started following you!`;
      case 'copy':
        return `${payload.liker_name || 'Someone'} copied your ${payload.recipe_title} recipe!`;
      default:
        return 'New notification';
    }
  };

  const getNotificationAvatar = (notification: Notification) => {
    const payload = notification.payload as any;
    return payload.liker_image || ''; // Avatar would need to be fetched separately or included in payload
  };

  const getNotificationUserName = (notification: Notification) => {
    const payload = notification.payload as any;
    return payload.liker_name || 'User';
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.is_read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <Avatar
        imageUrl={getNotificationAvatar(item)}
        firstName={getNotificationUserName(item)}
        size={44}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{getNotificationText(item)}</Text>
        <Text style={styles.notificationTime}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
      {!item.is_read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications yet.</Text>
      <Text style={styles.emptySubtext}>
        You&apos;ll see notifications when people interact with your recipes and cooking logs.
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Notifications" showBackButton={true} />

      {isLoadingNotifications ? (
        <NotificationsSkeletonLoader />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            notifications?.length === 0 ? styles.emptyListContainer : undefined
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
    backgroundColor: Colors.light.background,
  },
  unreadNotification: {
    backgroundColor: `${Colors.light.tint}08`,
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 13,
    color: '#79320680',
    marginTop: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    color: '#79320680',
    lineHeight: 22,
  },
});