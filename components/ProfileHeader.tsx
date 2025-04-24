import { View, StyleSheet, Text, Image } from 'react-native';
import { Profile, Log } from '@/types/db';

interface ProfileHeaderProps {
  profile: Partial<Profile>
  logs: Log[]
}
export default function ProfileHeader({ profile, logs }: ProfileHeaderProps) {
  return (
      <View style={styles.header}>
        <View>
            <Image source={{ uri: profile?.image }} style={styles.avatar} />
        </View>
        <View style={styles.info}>
            <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 16,
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