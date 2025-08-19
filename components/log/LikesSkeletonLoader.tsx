import React from 'react';
import { View, StyleSheet } from 'react-native';

const LikesSkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={index} style={styles.likeItem}>
          <View style={styles.avatar} />
          <View style={styles.textContainer}>
            <View style={styles.nameSkeleton} />
            <View style={styles.usernameSkeleton} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#79320633',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nameSkeleton: {
    height: 16,
    backgroundColor: '#79320633',
    borderRadius: 8,
    width: '60%',
    marginBottom: 4,
  },
  usernameSkeleton: {
    height: 14,
    backgroundColor: '#79320633',
    borderRadius: 7,
    width: '40%',
  },
});

export default LikesSkeletonLoader;
