import { View, StyleSheet, Text, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Profile, Log } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useFollow } from '@/hooks/useFollow';
import Avatar from './ui/Avatar';

interface ProfileHeaderProps {
  profile: Partial<Profile>
  logs: Log[]
}

export default function ProfileHeader({ profile, logs }: ProfileHeaderProps) {
  const { profile: currentProfile, signOut } = useAuth();
  const { isFollowing, loading, toggleFollow, followersCount, followingCount } = useFollow(profile?.id || '');

  const handleFollowersPress = () => {
    router.push({
      pathname: '/profile/followers',
      params: { 
        profileId: profile?.id,
        profileName: profile?.first_name 
      }
    });
  };

  const handleFollowingPress = () => {
    router.push({
      pathname: '/profile/following',
      params: { 
        profileId: profile?.id,
        profileName: profile?.first_name 
      }
    });
  };

  return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
              <Avatar 
                imageUrl={profile?.image} 
                firstName={profile?.first_name}
                size={100}
              />
          </View>
          <View style={styles.info}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
            </View>
              <View style={styles.stats}>
                  <View>
                      <Text>Meals</Text>
                      <Text style={styles.statValue}>{logs.length}</Text>
                  </View>
                  <TouchableOpacity onPress={handleFollowersPress}>
                      <Text>Followers</Text>
                      <Text style={styles.statValue}>{followersCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleFollowingPress}>
                      <Text>Following</Text>
                      <Text style={styles.statValue}>{followingCount}</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </View>
        <View style={styles.headerBottom}>
            {currentProfile?.id != profile?.id && (
              <TouchableOpacity 
                style={[styles.followButton, isFollowing && styles.followingButton]} 
                onPress={toggleFollow}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                )}
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
  followingButton: {
    backgroundColor: '#79320633',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  stats: {
    flexDirection: 'row',
    gap: 24
  },
  statValue: {
    fontWeight: 'bold',
    color: '#793206',
  },
});