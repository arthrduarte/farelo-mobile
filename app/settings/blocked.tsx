import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { useBlocks } from '@/hooks/useBlocks';
import Avatar from '@/components/ui/Avatar';
import BlockedUsersSkeletonLoader from '@/components/BlockedUsersSkeletonLoader';

interface BlockedUserItem {
  blocked_id: string;
  profile: Profile;
}

export default function BlockedUsersScreen() {
  const { profile: currentUser } = useAuth();
  const { unblockUser } = useBlocks();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlockedUsers = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select(`
          blocked_id,
          profiles!blocks_blocked_id_fkey(*)
        `)
        .eq('blocker_id', currentUser.id);

      if (error) throw error;

      const blockedUsersList = data?.map(block => ({
        blocked_id: block.blocked_id,
        profile: block.profiles as unknown as Profile
      })) || [];

      setBlockedUsers(blockedUsersList);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Error', 'Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = (userId: string, username: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock @${username}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await unblockUser(userId);
              setBlockedUsers(prev => prev.filter(user => user.blocked_id !== userId));
              Alert.alert('Success', `@${username} has been unblocked.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [currentUser]);

  const renderBlockedUser = ({ item }: { item: BlockedUserItem }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Avatar 
          imageUrl={item.profile.image} 
          firstName={item.profile.first_name} 
          size={40} 
        />
        <View style={styles.userDetails}>
          <Text style={styles.name}>
            {item.profile.first_name} {item.profile.last_name}
          </Text>
          <Text style={styles.username}>@{item.profile.username}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item.blocked_id, item.profile.username)}
      >
        <MaterialIcons name="person-add" size={20} color="white" />
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="block" size={64} color="#79320666" />
      <Text style={styles.emptyTitle}>No Blocked Users</Text>
      <Text style={styles.emptyDescription}>
        When you block users, they'll appear here and you can unblock them at any time.
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Blocked Users" showBackButton={true} />
      
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.blocked_id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!loading ? EmptyState : undefined}
        ListHeaderComponent={loading ? BlockedUsersSkeletonLoader : undefined}
        refreshing={false}
        onRefresh={fetchBlockedUsers}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7932061A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#79320680',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#793206',
    backgroundColor: '#793206',
  },
  unblockButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#79320680',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
}); 