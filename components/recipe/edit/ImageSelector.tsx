import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '@/utils/imageCompressor';

interface ImageSelectorProps {
  onImageSelected: (imageUri: string) => void;
  size?: number;
  color?: string;
}

export default function ImageSelector({
  onImageSelected,
  size = 24,
  color = '#EDE4D2',
}: ImageSelectorProps) {
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          const compressedImage = await compressImage(result.assets[0].uri, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.8,
          });
          onImageSelected(compressedImage);
        } catch (error) {
          console.error('Error compressing image:', error);
          onImageSelected(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
      <MaterialIcons name="edit" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#793206',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
