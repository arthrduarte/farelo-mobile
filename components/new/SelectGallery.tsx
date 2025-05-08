import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECIPE_KEYS } from '@/hooks/useRecipes';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/db';

export default function SelectGallery() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const uploadSteps = [
    "Reading recipe...",
    "Formatting recipe...",
    "Creating image..."
  ];

  // Effect to handle loading step changes
  useEffect(() => {
    if (!isUploading) {
      setUploadStep(0);
      return;
    }

    const timers = [
      setTimeout(() => setUploadStep(1), 5000),
      setTimeout(() => setUploadStep(2), 10000)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isUploading]);

  const importRecipeMutation = useMutation({
    mutationFn: async (images: string[]) => {
      if (!profile) throw new Error('User not authenticated');

      // Create form data
      const formData = new FormData();
      formData.append('profile_id', profile.id);
      
      // Append each image
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      console.log('Uploading images to server');
      const response = await fetch('https://usefarelo.com/api/recipes/import/images', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Note: Don't set Content-Type header, it's automatically set with boundary
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.error?.message || 'Failed to import recipe from images');
      }

      const { recipeId, success } = await response.json();
      console.log('Successfully imported recipe:', { recipeId, success });

      if (!success || !recipeId) {
        throw new Error('Failed to import recipe: Invalid response from server');
      }

      // Fetch the full recipe data from Supabase
      console.log('Fetching full recipe data from Supabase');
      const { data: recipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (fetchError || !recipe) {
        console.error('Error fetching recipe:', fetchError);
        throw new Error('Failed to fetch imported recipe details');
      }

      console.log('Full recipe data fetched:', recipe);
      return recipe as Recipe;
    },
    onSuccess: (newRecipe) => {
      console.log('Mutation succeeded, updating cache with recipe:', newRecipe);
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>(
        RECIPE_KEYS.list(newRecipe.profile_id),
        (oldRecipes) => {
          if (!oldRecipes) return [newRecipe];
          return [newRecipe, ...oldRecipes];
        }
      );

      // Navigate to the recipe details
      console.log('Navigating to recipe details with ID:', newRecipe.id);
      router.replace(`/recipe/${newRecipe.id}/details`);
    },
    onError: (error: Error) => {
      console.error('Import mutation error:', error);
      Alert.alert('Error', error.message);
    }
  });

  const handleSubmission = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    try {
      setIsUploading(true);
      await importRecipeMutation.mutateAsync(selectedImages);
    } catch (error) {
      // Error is handled by the mutation's onError
    } finally {
      setIsUploading(false);
    }
  };

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
          (selectedImages.length === 0 || isUploading) && styles.uploadButtonDisabled
        ]} 
        onPress={handleSubmission}
        disabled={selectedImages.length === 0 || isUploading}
      >
        {isUploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#EDE4D2" />
            <Text style={styles.uploadButtonText}>
              {uploadSteps[uploadStep]}
            </Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
