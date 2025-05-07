import { LogCard } from '@/components/LogCard';
import ProfileHeader from '@/components/ProfileHeader';
import { ThemedView } from '@/components/ThemedView';
import { useLogs } from '@/hooks/useLogs';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Profile } from '@/types/db';

export default function ProfileScreen() {
  const { id, profile: profileParam } = useLocalSearchParams();
  const { profileLogs } = useLogs(id as string);

  const profile = JSON.parse(profileParam as string) as Profile;

  const renderContent = () => {
    if(profileLogs.length === 0) {
      return <Text style={styles.noLogsText}>This user has no logs</Text>;
    }

    return (
      <>
        {profileLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </>
    );
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

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ProfileHeader profile={profile} logs={profileLogs} />
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  noLogsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#79320680',
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#79320680',
    fontSize: 16,
  }
});