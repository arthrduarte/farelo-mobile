import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  leftItem?: React.ReactNode;
  rightItem?: React.ReactNode;
  showBackButton?: boolean; // If true, a default back button will be shown if no leftItem is provided
}

export function ScreenHeader({ title, leftItem, rightItem, showBackButton }: ScreenHeaderProps) {
  const defaultBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if no back route is available, e.g., navigate to a default screen
      // router.replace('/(tabs)/'); // Example fallback
    }
  };

  const renderLeftItem = () => {
    if (leftItem) {
      return leftItem;
    }
    if (showBackButton) {
      return (
        <TouchableOpacity onPress={defaultBackPress}>
          <Feather name="arrow-left" size={24} color="#793206" />
        </TouchableOpacity>
      );
    }
    return null; // Or <View style={styles.placeholder} /> if you want to maintain space
  };

  return (
    <View style={styles.headerContainer}>
      <View style={[styles.headerItem, styles.leftItemContainer]}>
        {renderLeftItem()}
      </View>
      <View style={[styles.headerItem, styles.centerItemContainer]}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
      </View>
      <View style={[styles.headerItem, styles.rightItemContainer]}>
        {rightItem}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 10,
    backgroundColor: '#EDE4D2', // BEIGE - Secondary color
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633', // BROWN with low opacity
    height: Platform.OS === 'ios' ? 70 : 60, // Adjust height as needed
  },
  headerItem: {
    justifyContent: 'center',
  },
  leftItemContainer: {
    alignItems: 'flex-start',
    width: '25%',
  },
  centerItemContainer: {
    alignItems: 'center',
    width: '50%',
  },
  rightItemContainer: {
    alignItems: 'flex-end',
    width: '25%',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#793206', // BROWN - Main color
  },
  // placeholder: { // Optional: if you want to ensure the space is taken even if empty
  //   width: 24, // Example width, match your icon size or desired spacing
  //   height: 24,
  // }
}); 