import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { router } from 'expo-router';
import Avatar from '@/components/ui/Avatar';
import type { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import BlockedUsersSkeletonLoader from '@/components/BlockedUsersSkeletonLoader';
import { useGetAllBlockedUsers } from '@/hooks/blocks/useGetAllBlockedUsers';

export default function BlockedScreen() {
  const { profile } = useAuth();
  const { data: blockedUsers, isLoading: isLoadingBlockedUsers } = useGetAllBlockedUsers();

  const navigateToProfile = (item: Profile) => {
    if (item.id === profile?.id) {
      router.push('/profile');
    } else {
      router.push({
        pathname: '/profile/[id]',
        params: { id: item.id, profile: JSON.stringify(item) },
      });
    }
  };

  const renderBlockedUser = ({ item }: { item: Profile }) => (
    <TouchableOpacity style={styles.blockedItem} onPress={() => navigateToProfile(item)}>
      <Avatar imageUrl={item.image} firstName={item.first_name} size={50} />
      <View style={styles.blockedInfo}>
        <Text style={styles.blockedName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.blockedUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You haven&apos;t blocked any users yet.</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Blocked Users" showBackButton={true} />

      {isLoadingBlockedUsers ? (
        <BlockedUsersSkeletonLoader />
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={blockedUsers?.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  blockedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  blockedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  blockedUsername: {
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#79320680',
    marginTop: 12,
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
