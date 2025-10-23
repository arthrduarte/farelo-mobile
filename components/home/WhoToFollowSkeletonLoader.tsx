import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';

export const WhoToFollowSkeletonLoader = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(animation).start();
  }, []);

  const SkeletonItem = ({ style }: { style: any }) => (
    <Animated.View style={[styles.skeletonItem, style, { opacity: fadeAnim }]} />
  );

  const UserCardSkeleton = () => (
    <View style={styles.userCard}>
      <SkeletonItem style={styles.avatar} />
      <SkeletonItem style={styles.name} />
      <SkeletonItem style={styles.username} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <SkeletonItem style={styles.title} />
      </View>

      {/* User Cards ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card Skeletons */}
        {Array.from({ length: 5 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}

        {/* See More Card Skeleton */}
        <View style={[styles.userCard, styles.seeMoreCard]}>
          <SkeletonItem style={styles.seeMoreIcon} />
          <SkeletonItem style={styles.seeMoreText} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    height: 22,
    width: 120,
    backgroundColor: '#79320633',
    borderRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  userCard: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 100,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#79320633',
  },
  name: {
    height: 16,
    width: 80,
    backgroundColor: '#79320633',
    borderRadius: 8,
    marginTop: 8,
  },
  username: {
    height: 12,
    width: 60,
    backgroundColor: '#79320633',
    borderRadius: 8,
    marginTop: 4,
  },
  seeMoreCard: {
    justifyContent: 'center',
  },
  seeMoreIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#79320633',
  },
  seeMoreText: {
    height: 16,
    width: 70,
    backgroundColor: '#79320633',
    borderRadius: 8,
    marginTop: 8,
  },
  skeletonItem: {
    backgroundColor: '#79320633',
    borderRadius: 8,
  },
});
