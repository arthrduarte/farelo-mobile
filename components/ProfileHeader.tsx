import { View, StyleSheet, Text, Image, Button, TouchableOpacity } from 'react-native';
import { Profile, Log } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  profile: Partial<Profile>
  logs: Log[]
}
export default function ProfileHeader({ profile, logs }: ProfileHeaderProps) {
  const { profile: currentProfile } = useAuth();

  return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
              <Image source={{ uri: profile?.image }} style={styles.avatar} />
          </View>
          <View style={styles.info}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
              <Text style={styles.username}>@{profile?.username}</Text>
            </View>
              <View style={styles.stats}>
                  <View>
                      <Text>Meals</Text>
                      <Text style={styles.statValue}>{logs.length}</Text>
                  </View>
                  <View>
                      <Text>Followers</Text>
                      <Text style={styles.statValue}>10</Text>
                  </View>
                  <View>
                      <Text>Following</Text>
                      <Text style={styles.statValue}>10</Text>
                  </View>
              </View>
          </View>
        </View>
        <View style={styles.headerBottom}>
            {currentProfile?.id === profile?.id ? (
              <TouchableOpacity style={styles.followButton} onPress={() => router.push('/profile/edit')}>
                <Text style={styles.followButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  followButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#793206',
    color: '#fff',
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 20,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#793206',
  },
  username: {
    fontSize: 16,
    color: '#793206',
  },
  stats: {
    flexDirection: 'row',
    gap: 24
  },
  statValue: {
    fontWeight: 'bold',
    color: '#793206',
  },
});