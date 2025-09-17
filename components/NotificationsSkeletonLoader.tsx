import React from 'react';
import { View, StyleSheet } from 'react-native';

const NotificationsSkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {[...Array(8)].map((_, index) => (
        <View key={index} style={styles.notificationItem}>
          <View style={styles.avatar} />
          <View style={styles.notificationContent}>
            <View style={styles.textSkeleton} />
            <View style={styles.timeSkeleton} />
          </View>
          <View style={styles.unreadIndicator} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#79320620',
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  textSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#79320620',
    borderRadius: 4,
    marginBottom: 6,
  },
  timeSkeleton: {
    width: '40%',
    height: 12,
    backgroundColor: '#79320620',
    borderRadius: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#79320620',
    marginLeft: 8,
  },
});

export default NotificationsSkeletonLoader;