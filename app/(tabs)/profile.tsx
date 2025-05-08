import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import ProfileHeader from '@/components/ProfileHeader';
import { useLogs } from '@/hooks/useLogs';
import { LogCard } from '@/components/LogCard';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const { profileLogs } = useLogs(profile?.id ?? '');

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.headerItem, { alignItems: 'flex-start' }]}>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/profile/edit')}>
          <Text style={{ color: '#FFFFFF' }}>Edit profile</Text>
        </TouchableOpacity>
        </View>
        <View style={[styles.headerItem, { alignItems: 'center' }]}>
          <Text style={styles.username}>{profile.username}</Text>
        </View>
        <View style={[styles.headerItem, { alignItems: 'flex-end' }]}>
        <TouchableOpacity onPress={() => router.push('/profile/settings')} style={styles.searchIconContainer}>
          <Feather name="settings" size={24} color="#793206" />
        </TouchableOpacity>
        </View>
      </View>

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