import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import { useLogs } from '@/hooks/useLogs';
import { LogCard } from '@/components/LogCard';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { profileLogs } = useLogs(profile?.id ?? '');

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ProfileHeader profile={profile} logs={profileLogs} />
        {profileLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </ScrollView>
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