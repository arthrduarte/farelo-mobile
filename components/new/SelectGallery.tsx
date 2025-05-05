import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SelectGallery() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const pickImages = async () => {
    try {
      // Request permissions if needed
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      // Only allow picking more images if we have less than 3
      if (selectedImages.length >= 3) {
        alert('You can only select up to 3 images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 3 - selectedImages.length,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => {
          const combined = [...prev, ...newImages];
          return combined.slice(0, 3); // Ensure we never exceed 3 images
        });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      alert('Failed to pick images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmission = () => {
    console.log('Submission');
  }

  return (
    <>
      <ScrollView 
        horizontal={selectedImages.length > 0}
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={selectedImages.length === 0 && styles.scrollViewEmpty}
      >
        {selectedImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          </View>
        ))}
        {selectedImages.length < 3 && (
          <TouchableOpacity 
            style={[
              styles.placeholderContainer,
              selectedImages.length === 0 && styles.placeholderContainerFullWidth
            ]} 
            onPress={pickImages}
            activeOpacity={0.7}
          >
            <MaterialIcons name="photo-library" size={48} color="#79320680" />
            <Text style={styles.placeholderText}>
              {selectedImages.length === 0 
                ? 'Tap to select images'
                : `Add ${3 - selectedImages.length} more image${3 - selectedImages.length > 1 ? 's' : ''}`
              }
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <TouchableOpacity 
        style={[
          styles.uploadButton,
          selectedImages.length === 0 && styles.uploadButtonDisabled
        ]} 
        onPress={handleSubmission}
        disabled={selectedImages.length === 0}
      >
        <Text style={styles.uploadButtonText}>Continue</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  scrollViewEmpty: {
    flex: 1,
  },
  placeholderContainer: {
    backgroundColor: '#79320633',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    width: 250,
    justifyContent: 'center',
  },
  placeholderContainerFullWidth: {
    width: '100%',
  },
  placeholderText: {
    color: '#793206',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 250,
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EDE4D2',
    borderRadius: 12,
    padding: 4,
  },
  uploadButton: {
    backgroundColor: '#793206',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#79320680',
  },
  uploadButtonText: {
    color: '#EDE4D2',
    fontSize: 16,
    fontWeight: '600',
  },
});
