import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { useLikesForLog } from '@/hooks/likes';
import Avatar from '@/components/ui/Avatar';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import LikesSkeletonLoader from '@/components/log/LikesSkeletonLoader';

export default function LikesScreen() {
  const { logId } = useLocalSearchParams();
  const { data: likes, isLoading, error, refetch } = useLikesForLog(logId as string);
  const { profile: currentProfile } = useAuth();

  const renderLike = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.likeItem}
      onPress={() => {
        if (item.id === currentProfile?.id) {
          router.push('/profile');
        } else {
          router.push({
            pathname: '/profile/[id]',
            params: { id: item.id, profile: JSON.stringify(item) },
          });
        }
      }}
    >
      <Avatar imageUrl={item.image} firstName={item.first_name} size={50} />
      <View style={styles.likeInfo}>
        <Text style={styles.likeName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.likeUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No one has liked this post yet.</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load likes</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Likes" showBackButton={true} />

      {isLoading ? (
        <LikesSkeletonLoader />
      ) : error ? (
        <ErrorState />
      ) : (
        <FlatList
          data={likes}
          renderItem={renderLike}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={likes?.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  likeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  likeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  likeUsername: {
    fontSize: 14,
    color: '#79320680',
    marginTop: 2,
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
    fontSize: 16,
    textAlign: 'center',
    color: '#79320680',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#793206',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#793206',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
