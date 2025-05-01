import { LogCard } from '@/components/LogCard';
import ProfileHeader from '@/components/ProfileHeader';
import { ThemedView } from '@/components/ThemedView';
import { useLogs } from '@/hooks/useLogs';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const { profileLogs } = useLogs(id as string);

  const profile = profileLogs[0]?.profile;

  return (
    <ThemedView style={styles.container}>
      <ProfileHeader profile={profile} logs={profileLogs} />
      {profileLogs.map((log) => (
        <LogCard key={log.id} log={log} />
      ))}
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});