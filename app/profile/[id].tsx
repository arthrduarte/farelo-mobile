import { LogCard } from '@/components/LogCard';
import ProfileHeader from '@/components/ProfileHeader';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLogs } from '@/hooks/useLogs';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, Animated } from 'react-native';
import { Profile } from '@/types/db';
import { LogLoader } from '@/components/log/LogLoader';
import { useFollow } from '@/hooks/useFollow';
import Drawer from '@/components/ui/Drawer';
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlocks } from '@/hooks/useBlocks';

export default function ProfileScreen() {
  const { id, profile: profileParam } = useLocalSearchParams();
  const { profileLogs, profileLogsLoading, refreshProfileLogs } = useLogs(id as string);
  const { isFollowing, loading, toggleFollow, followersCount, followingCount } = useFollow(id as string);
  const { profile: currentUserProfile } = useAuth();
  const profile = JSON.parse(profileParam as string) as Profile;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const { blockUser, unblockUser, getAllBlockedIds, isBlocked } = useBlocks(profile?.id);
  
  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleReportProfile = () => {
    if (!profile || !profile.id) return;
    toggleDrawer();
    router.push(`/report?type=profile&itemId=${profile.id}`);
  };

  const handleBlockUser = () => {
    if (!profile || !profile.id) return;
    toggleDrawer();
    blockUser(profile.id);
  };

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#793206" />
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </ThemedView>
    );
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
      <ProfileHeader 
        profile={profile} 
        logs={profileLogs} 
        isFollowing={isFollowing} 
        loading={loading} 
        toggleFollow={toggleFollow} 
        followersCount={followersCount} 
        followingCount={followingCount}
        isBlocked={isBlocked}
      />
    );
  };
  
  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isBlocked 
          ? "You can't see this user's logs because they are blocked." 
          : "This user hasn't posted any logs yet."}
      </Text>
    </View>
  );

  const drawerOptions = [
    {
      icon: 'report' as keyof typeof MaterialIcons.glyphMap,
      text: 'Report Profile',
      onPress: handleReportProfile,
    },
    {
      icon: isBlocked ? 'person-add' : 'block' as keyof typeof MaterialIcons.glyphMap,
      text: isBlocked ? 'Unblock User' : 'Block User',
      onPress: isBlocked ? () => unblockUser(profile.id) : handleBlockUser,
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader 
        title={profile.username} 
        showBackButton={true}
        rightItem={
            <TouchableOpacity onPress={toggleDrawer}>
              <MaterialIcons name="more-vert" size={24} color="#793206" />
            </TouchableOpacity>
        }
      />

      <FlatList
        style={styles.list}
        data={isBlocked ? [] : profileLogs}
        renderItem={({ item }) => (
          <LogCard key={item.id} log={item} />
        )}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={() => {
          if (profileLogsLoading && !isBlocked) {
            return <LoadingComponent />;
          }
          return <EmptyStateComponent />;
        }}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshProfileLogs}
        refreshing={profileLogsLoading}
      />
      
      <Drawer
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        drawerAnimation={drawerAnimation}
        options={drawerOptions}
        title="Options"
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
  backButton: {
    height: 40,
    borderRadius: 20,
    marginHorizontal: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
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
  emptyContainer: { 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#793206',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#79320680',
    fontSize: 16,
  }
});