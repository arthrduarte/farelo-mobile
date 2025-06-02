import React from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLocalSearchParams, router } from 'expo-router';
import { useFollowers } from '@/hooks/useFollowers';
import Avatar from '@/components/ui/Avatar';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';

export default function FollowersScreen() {
  const { profileId, profileName } = useLocalSearchParams();
  const { followers, loading, error, refetch } = useFollowers(profileId as string);
  const { profile: currentProfile } = useAuth();

  const renderFollower = ({ item }: { item: Profile }) => (
    <TouchableOpacity 
      style={styles.followerItem}
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
      <View style={styles.followerInfo}>
        <Text style={styles.followerName}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={styles.followerUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {profileName ? `${profileName} has no followers yet.` : 'No followers yet.'}
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#793206" />
      <Text style={styles.loadingText}>Loading followers...</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load followers</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title="Followers" 
        showBackButton={true}
      />
      
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={loading}
          contentContainerStyle={followers.length === 0 ? styles.emptyListContainer : undefined}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  followerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  followerUsername: {
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