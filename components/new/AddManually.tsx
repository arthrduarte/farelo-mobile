import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Recipe } from '@/types/db';
import { useCreateRecipe } from '@/hooks/recipes';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Divider } from '@/components/Divider';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import 'react-native-url-polyfill/auto';

// Define a type for the manual form data, omitting fields not manually entered
type ManualRecipeFormData = Pick<
  Recipe,
  | 'title'
  | 'description'
  | 'time'
  | 'servings'
  | 'ingredients'
  | 'instructions'
  | 'tags'
  | 'notes'
  | 'source_url'
  | 'user_image_url'
>;

// Final data structure for submission (includes filtered lists)
export type FinalManualRecipeData = Omit<
  ManualRecipeFormData,
  'ingredients' | 'instructions' | 'tags'
> & {
  ingredients: string[];
  instructions: string[];
  tags: string[];
  user_image_url: string | null;
};

// Initial state for the manual form
const initialManualFormData: ManualRecipeFormData = {
  title: '',
  description: '',
  time: 0,
  servings: 0,
  ingredients: [''],
  instructions: [''],
  tags: [''],
  notes: '',
  source_url: '',
  user_image_url: null,
};

export default function AddManually() {
  const [manualFormData, setManualFormData] = useState<ManualRecipeFormData>(initialManualFormData);
  const createRecipeMutation = useCreateRecipe();
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Sorry, we need camera roll permissions to make this work!',
          );
        }
      }
    })();
  }, []);

  const handleManualFormChange = (
    field: keyof Omit<
      ManualRecipeFormData,
      'ingredients' | 'instructions' | 'tags' | 'user_image_url'
    >,
    value: string | number | string[] | null,
  ) => {
    setManualFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmission = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!manualFormData.title.trim()) {
        Alert.alert('Error', 'Please enter a title');
        return;
      }
      if (!manualFormData.time || manualFormData.time <= 0) {
        Alert.alert('Error', 'Please enter a valid cooking time');
        return;
      }
      if (!manualFormData.servings || manualFormData.servings <= 0) {
        Alert.alert('Error', 'Please enter a valid number of servings');
        return;
      }

      // Filter out empty items
      const finalIngredients = manualFormData.ingredients.filter((item) => item.trim() !== '');
      const finalInstructions = manualFormData.instructions.filter((item) => item.trim() !== '');
      const finalTags = manualFormData.tags.filter((item) => item.trim() !== '');

      if (finalIngredients.length === 0) {
        Alert.alert('Error', 'Please add at least one ingredient');
        return;
      }
      if (finalInstructions.length === 0) {
        Alert.alert('Error', 'Please add at least one instruction');
        return;
      }

      let uploadedImageUrl: string | null = null;
      if (selectedImage) {
        uploadedImageUrl = await uploadImage(selectedImage);
        if (!uploadedImageUrl) {
          // Upload failed, alert was already shown in uploadImage
          setIsSubmitting(false); // Allow user to try again
          return;
        }
      }

      // Prepare final data
      const finalData: FinalManualRecipeData = {
        ...manualFormData,
        ingredients: finalIngredients,
        instructions: finalInstructions,
        tags: finalTags,
        user_image_url: uploadedImageUrl,
      };

      // Submit to Supabase
      const newRecipe = await createRecipeMutation.mutateAsync(finalData);

      // Navigate to the recipe details
      router.replace({
        pathname: '/recipe/[recipeId]/details',
        params: { recipeId: newRecipe.id },
      });
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Error', 'Failed to create recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListItemChange = (
    listType: 'ingredients' | 'instructions' | 'tags',
    index: number,
    value: string,
  ) => {
    setManualFormData((prev) => {
      const newList = [...prev[listType]];
      newList[index] = value;
      return { ...prev, [listType]: newList };
    });
  };

  const addListItem = (listType: 'ingredients' | 'instructions' | 'tags') => {
    setManualFormData((prev) => ({
      ...prev,
      [listType]: [...prev[listType], ''],
    }));
  };

  const removeListItem = (listType: 'ingredients' | 'instructions' | 'tags', index: number) => {
    setManualFormData((prev) => {
      if (prev[listType].length <= 1) return prev;
      const newList = [...prev[listType]];
      newList.splice(index, 1);
      return { ...prev, [listType]: newList };
    });
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Adjusted quality for faster uploads
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      // We don't set manualFormData.user_image_url here directly.
      // It will be set after successful upload in handleSubmission.
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    if (!profile) {
      Alert.alert('Error', 'You must be logged in to upload images');
      return null;
    }

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const contentType = `image/${fileExt}`;
      const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('recipe_images')
        .upload(fileName, decode(base64), {
          contentType,
        });

      if (uploadError) {
        console.error('Supabase Upload Error:', uploadError);
        Alert.alert('Upload Error', `Failed to upload image: ${uploadError.message}`);
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from('recipe_images').getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Error getting public URL: No public URL found or data is null');
        Alert.alert('Upload Error', 'Failed to get image URL after upload.');
        return null;
      }

      return publicUrlData.publicUrl;
    } catch (e: unknown) {
      console.error('Upload process error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert(
        'Upload Error',
        `An unexpected error occurred during image upload: ${errorMessage}`,
      );
      return null;
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    // Also clear it from form data if it was set
    setManualFormData((prev) => ({ ...prev, user_image_url: null }));
  };

  return (
    <View style={styles.manualFormContainer}>
      {/* Title */}
      <Text style={styles.formLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Recipe Title"
        value={manualFormData.title}
        onChangeText={(text) => handleManualFormChange('title', text)}
        placeholderTextColor="#79320680"
      />

      {/* Description */}
      <Text style={styles.formLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Brief description..."
        value={manualFormData.description}
        onChangeText={(text) => handleManualFormChange('description', text)}
        placeholderTextColor="#79320680"
        multiline
      />

      {/* Recipe Image */}
      <Text style={styles.formLabel}>Recipe Image</Text>
      <View style={styles.imagePickerContainer}>
        {selectedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
              <MaterialIcons name="close" size={24} color="#793206" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImageAsync}>
            <MaterialIcons name="add-photo-alternate" size={30} color="#793206" />
            <Text style={styles.imagePickerButtonText}>Add Recipe Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Time & Servings */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.formLabel}>Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30"
            value={manualFormData.time ? String(manualFormData.time) : ''}
            onChangeText={(text) => handleManualFormChange('time', Number(text) || 0)}
            placeholderTextColor="#79320680"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.formLabel}>Servings</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 4"
            value={manualFormData.servings ? String(manualFormData.servings) : ''}
            onChangeText={(text) => handleManualFormChange('servings', Number(text) || 0)}
            placeholderTextColor="#79320680"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Ingredients */}
      <Text style={styles.formLabel}>Ingredients</Text>
      {manualFormData.ingredients.map((ingredient, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput]}
            placeholder={`Ingredient ${index + 1}`}
            value={ingredient}
            onChangeText={(text) => handleListItemChange('ingredients', index, text)}
            placeholderTextColor="#79320680"
          />
          {/* Show remove button only if there's more than one item */}
          {manualFormData.ingredients.length > 1 && (
            <TouchableOpacity
              onPress={() => removeListItem('ingredients', index)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('ingredients')}>
        <MaterialIcons name="add" size={20} color="#793206" />
        <Text style={styles.addButtonText}>Add Ingredient</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <Text style={styles.formLabel}>Instructions</Text>
      {manualFormData.instructions.map((instruction, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput, styles.textAreaShort]} // Apply text area style for multiline
            placeholder={`Step ${index + 1}`}
            value={instruction}
            onChangeText={(text) => handleListItemChange('instructions', index, text)}
            placeholderTextColor="#79320680"
            multiline // Allow multiline instructions per step
          />
          {/* Show remove button only if there's more than one item */}
          {manualFormData.instructions.length > 1 && (
            <TouchableOpacity
              onPress={() => removeListItem('instructions', index)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('instructions')}>
        <MaterialIcons name="add" size={20} color="#793206" />
        <Text style={styles.addButtonText}>Add Instruction</Text>
      </TouchableOpacity>

      {/* Tags */}
      <Text style={styles.formLabel}>Tags</Text>
      {manualFormData.tags.map((tag, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput]}
            placeholder={`Tag ${index + 1}`}
            value={tag}
            onChangeText={(text) => handleListItemChange('tags', index, text)}
            placeholderTextColor="#79320680"
          />
          {/* Show remove button only if there's more than one item */}
          {manualFormData.tags.length > 1 && (
            <TouchableOpacity
              onPress={() => removeListItem('tags', index)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('tags')}>
        <MaterialIcons name="add" size={20} color="#793206" />
        <Text style={styles.addButtonText}>Add Tag</Text>
      </TouchableOpacity>

      {/* Notes */}
      <Text style={styles.formLabel}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Optional notes..."
        value={manualFormData.notes}
        onChangeText={(text) => handleManualFormChange('notes', text)}
        placeholderTextColor="#79320680"
        multiline
      />

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmission}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Creating Recipe...' : 'Submit'}
        </Text>
      </TouchableOpacity>

      <Divider />
    </View>
  );
}

// Styles moved from the parent component
const styles = StyleSheet.create({
  manualFormContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    color: '#793206',
    borderWidth: 1,
    borderColor: '#79320633',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // Align text to the top for multiline
  },
  textAreaShort: {
    minHeight: 50, // Adjust as needed
    textAlignVertical: 'top',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16, // Add gap between columns
  },
  column: {
    flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
    marginBottom: 8,
  },
  listItemInput: {
    flex: 1, // Take up available space
    marginRight: 8, // Space before remove button
  },
  removeButton: {
    padding: 4, // Make touch target slightly larger
    backgroundColor: '#79320633', // Subtle background
    borderRadius: 15, // Circular touch area
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content
    gap: 8, // Space between icon and text
    marginTop: 8, // Space above button
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 16, // Horizontal padding
    borderRadius: 8,
    width: '100%', // Make button full width within its container
    backgroundColor: '#79320633', // Use low opacity brown
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#793206',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#EDE4D2',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  imagePickerContainer: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center', // Center the button or preview
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#79320633', // Low opacity brown
    width: '100%', // Make it full width
  },
  imagePickerButtonText: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative', // For positioning the clear button
    alignItems: 'center',
  },
  imagePreview: {
    width: 200, // Adjust as needed
    height: 150, // Adjust as needed, maintaining aspect ratio if possible
    borderRadius: 8,
    marginBottom: 8, // Space before clear button (if button is outside)
  },
  clearImageButton: {
    position: 'absolute',
    top: -10, // Adjust to position correctly over the image corner
    right: -10, // Adjust to position correctly over the image corner
    backgroundColor: '#EDE4D2', // Beige, or use a contrasting color
    borderRadius: 15, // Make it circular
    padding: 5,
    elevation: 2, // Shadow for Android
    zIndex: 1, // Ensure it's above the image
  },
});
