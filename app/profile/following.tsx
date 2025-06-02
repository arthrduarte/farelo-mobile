import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { useFollowing } from '@/hooks/useFollowing';
import Avatar from '@/components/ui/Avatar';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';

export default function FollowingScreen() {
  const { profileId, profileName } = useLocalSearchParams();
  const { following, loading, error, refetch } = useFollowing(profileId as string);
  const { profile: currentProfile } = useAuth();

  const renderFollowing = ({ item }: { item: Profile }) => (
    <TouchableOpacity 
      style={styles.followingItem}
      onPress={() => {
        if (item.id === currentProfile?.id) {
          router.push('/profile');
        } else {
          router.push({
            pathname: '/profile/[id]',
            params: { id: item.id, profile: JSON.stringify(item) }
          });
        }
      }}
    >
      <Avatar 
        imageUrl={item.image} 
        firstName={item.first_name}
        size={50}
      />
      <View style={styles.followingInfo}>
        <Text style={styles.followingName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.followingUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {profileName ? `${profileName} isn't following anyone yet.` : 'Not following anyone yet.'}
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#793206" />
      <Text style={styles.loadingText}>Loading following...</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load following</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Following" 
        showBackButton={true}
      />
      
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : (
        <FlatList
          data={following}
          renderItem={renderFollowing}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          contentContainerStyle={following.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  followingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  followingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  followingUsername: {
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