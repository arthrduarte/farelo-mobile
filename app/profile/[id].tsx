import { LogCard } from '@/components/LogCard';
import ProfileHeader from '@/components/ProfileHeader';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useLogs } from '@/hooks/useLogs';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { Profile } from '@/types/db';
import { LogLoader } from '@/components/log/LogLoader';

export default function ProfileScreen() {
  const { id, profile: profileParam } = useLocalSearchParams();
  const { profileLogs, profileLogsLoading, refreshProfileLogs } = useLogs(id as string);

  const profile = JSON.parse(profileParam as string) as Profile;

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
      <ProfileHeader profile={profile} logs={profileLogs} />
    );
  };
  
  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>This user hasn't posted any logs yet.</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title={profile.username} showBackButton={true} />

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
          if (!profileLogsLoading && profileLogs.length === 0) {
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