import { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Divider } from '@/components/Divider';

export const LogLoader = () => {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonItem style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonItem style={styles.name} />
          <SkeletonItem style={styles.time} />
        </View>
      </View>

      {/* Title and Description */}
      <SkeletonItem style={styles.title} />
      <SkeletonItem style={styles.description} />

      {/* Meta Info */}
      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <View style={styles.timeIcon}>
            <MaterialIcons name="schedule" size={16} color="#79320633" />
          </View>
          <SkeletonItem style={styles.metaText} />
        </View>
        <View style={styles.metaItem}>
          <View style={styles.servingsIcon}>
            <MaterialIcons name="people" size={16} color="#79320633" />
          </View>
          <SkeletonItem style={styles.metaText} />
        </View>
      </View>

      {/* Image */}
      <SkeletonItem style={styles.mainImage} />

      {/* Interactions */}
      <View style={styles.interactionsContainer}>
        <SkeletonItem style={styles.interactionsAmount} />
        <SkeletonItem style={styles.interactionsAmount} />
      </View>

      <Divider />

      {/* Actions */}
      <View style={styles.actions}>
        <SkeletonItem style={styles.actionButton} />
        <SkeletonItem style={styles.actionButton} />
        <SkeletonItem style={styles.actionButton} />
      </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#EDE4D2',
  },
  skeletonItem: {
    backgroundColor: '#79320633',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    height: 16,
    width: '40%',
  },
  time: {
    height: 12,
    width: '30%',
  },
  title: {
    height: 24,
    width: '60%',
    marginBottom: 4,
  },
  description: {
    height: 16,
    width: '80%',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    height: 16,
    width: 60,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  interactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interactionsAmount: {
    height: 14,
    width: 80,
  },
  divider: {
    height: 1,
    backgroundColor: '#79320633',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
  },
}); 