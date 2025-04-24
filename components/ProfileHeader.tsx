import { View, StyleSheet, Text, Image } from 'react-native';
import { Profile } from '@/types/db';

interface ProfileHeaderProps {
  profile: Partial<Profile>
}
export default function ProfileHeader({ profile }: ProfileHeaderProps) {
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
                    <Text>10</Text>
                </View>
                <View>
                    <Text>Meals</Text>
                    <Text>10</Text>
                </View>
                <View>
                    <Text>Meals</Text>
                    <Text>10</Text>
                </View>
            </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
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