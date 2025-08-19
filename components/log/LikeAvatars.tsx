import React from 'react';
import { View, StyleSheet } from 'react-native';
import Avatar from '@/components/ui/Avatar';
import { Profile } from '@/types/db';

type LikeAvatarsProps = {
  profiles: Profile[];
  maxDisplay?: number;
};

export const LikeAvatars: React.FC<LikeAvatarsProps> = ({ profiles, maxDisplay = 3 }) => {
  if (!profiles || profiles.length === 0) {
    return null;
  }

  const displayProfiles = profiles.slice(0, maxDisplay);

  return (
    <View style={styles.container}>
      {displayProfiles.map((profile, index) => (
        <View
          key={profile.id}
          style={[
            styles.avatarWrapper,
            index > 0 && { marginLeft: -8 }, // Overlap avatars slightly
          ]}
        >
          <Avatar imageUrl={profile.image} firstName={profile.first_name} size={20} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarWrapper: {
    borderRadius: 10,
  },
});
