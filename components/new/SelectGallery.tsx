import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SelectGalleryProps {
  onPress: () => void;
}

export default function SelectGallery({ onPress }: SelectGalleryProps) {
  return (
    <TouchableOpacity 
      style={styles.placeholderContainer} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="photo-library" size={48} color="#79320680" />
      <Text style={styles.placeholderText}>Tap to select an image</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: '#79320633',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#793206',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
