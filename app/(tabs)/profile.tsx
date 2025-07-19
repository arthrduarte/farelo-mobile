import { View, StyleSheet, Text, Image, TouchableOpacity, Platform, FlatList } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLogs } from '@/hooks/useLogs';
import { LogCard } from '@/components/log/LogCard';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LogLoader } from '@/components/log/LogLoader';
import { useFollow } from '@/hooks/useFollow';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { profileLogs, profileLogsLoading, refreshProfileLogs } = useLogs(profile?.id ?? '');
  const { isFollowing, loading, toggleFollow, followersCount, followingCount } = useFollow(profile?.id || '');

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  const LoadingComponent = () => {
    return (
      <>
        <LogLoader />
        <LogLoader />
        <LogLoader />
      </>
    );
  };

  const HeaderComponent = () => {
    return (
      <ProfileHeader profile={profile} logs={profileLogs} isFollowing={isFollowing} loading={loading} toggleFollow={toggleFollow} followersCount={followersCount} followingCount={followingCount} />
    );
  };
  
  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>This user hasn't posted any logs yet.</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title={profile.username} 
        rightItem={
          <TouchableOpacity onPress={() => router.push('/settings/main')}>
            <Feather name="settings" size={24} color="#793206" />
          </TouchableOpacity>
        }
        leftItem={
          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <Text style={{ color: '#793206' }}>Edit Profile</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        style={styles.list}
        data={profileLogs} 
        renderItem={({ item }) => (
          <LogCard key={item.id} log={item} />
        )}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={() => {
          if (profileLogsLoading) {
            return <LoadingComponent />;
          }
          if (profileLogs.length === 0) {
            return <EmptyStateComponent />;
          }
          return null; 
        }}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshProfileLogs}
        refreshing={profileLogsLoading}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 50, // Adjust as needed to be below the header
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#793206',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 10,
    backgroundColor: '#EDE4D2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  headerItem: {
    width: '33%',
  },
  headerTitlePlaceholder: {
    width: 24,
  },
  editProfileButton: {
    backgroundColor: '#793206',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#793206',
  },
  searchIconContainer: {
    padding: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    gap: 24
  },
});