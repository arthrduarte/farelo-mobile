import React from 'react';
import { View, StyleSheet } from 'react-native';

const BlockedUsersSkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={styles.userItem}>
          <View style={styles.userInfo}>
            <View style={styles.avatar} />
            <View style={styles.userDetails}>
              <View style={styles.nameSkeleton} />
              <View style={styles.usernameSkeleton} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#7932061A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#79320620',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#79320620',
    borderRadius: 4,
    marginBottom: 4,
  },
  usernameSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: '#79320620',
    borderRadius: 4,
  },
  buttonSkeleton: {
    width: 80,
    height: 32,
    backgroundColor: '#79320620',
    borderRadius: 8,
  },
});

export default BlockedUsersSkeletonLoader; 