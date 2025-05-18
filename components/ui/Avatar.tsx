import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  imageUrl?: string;
  firstName?: string;
  size?: number;
}

export default function Avatar({ imageUrl, firstName = '', size = 100 }: AvatarProps) {
  const firstLetter = firstName.charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <Image 
        source={{ uri: imageUrl }} 
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 }
        ]} 
      />
    );
  }

  return (
    <View style={[
      styles.fallbackContainer,
      { width: size, height: size, borderRadius: size / 2 }
    ]}>
      <Text style={[
        styles.fallbackText,
        { fontSize: size * 0.4 }
      ]}>
        {firstLetter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#EDE4D2',
  },
  fallbackContainer: {
    backgroundColor: '#79320633',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#793206',
    fontWeight: 'bold',
  },
});
