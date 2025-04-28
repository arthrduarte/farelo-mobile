import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function RecipeSkeletonLoader() {
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

  return (
    <>
      {/* Title Skeleton */}
      <SkeletonItem style={styles.title} />

      {/* Meta Info Skeleton */}
      <View style={styles.metaInfo}>
        <SkeletonItem style={styles.metaItem} />
        <SkeletonItem style={styles.metaItem} />
      </View>

      {/* Start Meal Button Skeleton */}
      <SkeletonItem style={styles.startMealButton} />

      {/* Image Skeleton */}
      <SkeletonItem style={styles.image} />

      {/* Action Buttons Skeleton */}
      <View style={styles.actionButtons}>
        <SkeletonItem style={styles.actionButton} />
        <SkeletonItem style={styles.actionButton} />
        <SkeletonItem style={styles.actionButton} />
      </View>

      {/* Tags Skeleton */}
      <View style={styles.tagContainer}>
        <SkeletonItem style={styles.tag} />
        <SkeletonItem style={styles.tag} />
        <SkeletonItem style={styles.tag} />
      </View>

      {/* Ingredients Section */}
      <SkeletonItem style={styles.sectionTitle} />
      <View style={styles.ingredientsList}>
        <SkeletonItem style={styles.ingredient} />
        <SkeletonItem style={styles.ingredient} />
        <SkeletonItem style={styles.ingredient} />
      </View>

      {/* Instructions Section */}
      <SkeletonItem style={styles.sectionTitle} />
      <View style={styles.instructionsList}>
        <SkeletonItem style={styles.instruction} />
        <SkeletonItem style={styles.instruction} />
        <SkeletonItem style={styles.instruction} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  skeletonItem: {
    backgroundColor: '#79320633',
    borderRadius: 8,
  },
  title: {
    height: 32,
    width: '70%',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    height: 24,
    width: 100,
  },
  startMealButton: {
    height: 48,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    height: 40,
    width: 40,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    height: 28,
    width: 80,
    borderRadius: 14,
  },
  sectionTitle: {
    height: 28,
    width: '40%',
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
    marginBottom: 24,
  },
  ingredient: {
    height: 24,
    width: '90%',
  },
  instructionsList: {
    gap: 12,
    marginBottom: 24,
  },
  instruction: {
    height: 24,
    width: '100%',
  },
}); 