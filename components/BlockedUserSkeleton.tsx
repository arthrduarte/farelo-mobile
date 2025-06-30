import { View, StyleSheet,  Animated } from 'react-native';
import { useEffect } from 'react';

export const BlockedUserSkeleton = () => {
  const pulseAnim = new Animated.Value(0);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  const opacity = pulseAnim;

  return (
    <View style={styles.blockedItem}>
      <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
      <View style={styles.blockedInfo}>
        <Animated.View style={[styles.nameSkeleton, { opacity }]} />
        <Animated.View style={[styles.usernameSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  blockedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  blockedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  blockedUsername: {
    fontSize: 14,
    color: '#79320680',
    marginTop: 2,
  },
  avatarSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#79320633',
  },
  nameSkeleton: {
    width: 150,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#79320633',
    marginBottom: 4,
  },
  usernameSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#79320633',
  },
});
