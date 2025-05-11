import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Divider } from '@/components/Divider';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import 'react-native-url-polyfill/auto';

export default function FinishRecipeScreen() {
  const { recipeId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const updateRecipeMutation = useUpdateRecipe();
  
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[] | null>(null);

  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...(images || []), result.assets[0].uri]);
    }
  }

  const removeImage = (index: number) => {
    setImages(images?.filter((_, i) => i !== index) || null);
  }

  const handleNewLog = async () => {
    if (!recipe || !profile) return;

    try {
      setIsSubmitting(true);
      
      // 1. Upload images to storage if they exist
      let uploadedImageUrls: string[] = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map(async (uri) => {
          try {
            
            // Read the file content as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Determine file type and name
            const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg'; // Simple extension extraction
            const contentType = `image/${fileExt}`; // Basic content type mapping
            const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`; 
            

            // Upload the decoded base64 content
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('log.images')
              .upload(fileName, decode(base64), { contentType }); // Use decode and set content type

            if (uploadError) {
              console.error(`Supabase Upload Error for ${fileName}:`, uploadError);
              throw uploadError; // Re-throw Supabase specific error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('log.images')
              .getPublicUrl(fileName);
              
            return publicUrl;

          } catch (fileProcessingError) {
             console.error(`Error processing or uploading file ${uri}:`, fileProcessingError);
             throw fileProcessingError; // Re-throw error to stop Promise.all
          }
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      }

      // 2. Update recipe with new user images (Consider if this is still needed if log has images)
      // Maybe only update if there were pre-existing images or notes change?
      const updatedNotes = recipe.notes ? recipe.notes + " | " + notes : notes; // Combine notes if existing ones
      // Only update user_images_url on the recipe if it makes sense in your data model
      // For now, let's assume the log images are sufficient and we only update notes
      await updateRecipeMutation.mutateAsync({
        ...recipe,
        notes: notes ? updatedNotes : recipe.notes, // Update notes only if new notes were added
        // user_images_url: uploadedImageUrls.length > 0 ? uploadedImageUrls : recipe.user_images_url, // Decide if recipe needs user_images_url
      });


      // 3. Create new log
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          profile_id: profile.id,
          recipe_id: recipe.id,
          description: description || null, // Use null if empty
          images: uploadedImageUrls.length > 0 ? uploadedImageUrls : [recipe.ai_image_url], // Use uploaded or fallback to AI image
        });

      if (logError) {
        console.error("Supabase Insert Log Error:", logError);
        throw new Error(logError.message); // Use new Error for consistency
      }

      // Use replace to prevent going back to the form
      router.replace('/(tabs)');
    } catch (error) {
      // Catch errors from file processing, upload, recipe update, or log insert
      console.error('Error in handleNewLog:', error); 
      // TODO: Add user-facing error handling UI (e.g., Alert.alert('Upload Failed', error.message))
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#793206" />
      </ThemedView>
    );
  }

  if (isError || !recipe) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Finish Recipe" showBackButton={true} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {/* Header */}
        <Text style={styles.title}>{recipe.title}</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="How was it? Tell people about it here..."
            placeholderTextColor="#79320680"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Divider />

        {/* Images */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContentContainer}
        >
          {/* Show AI image only if no user images */}
          {(!images || images.length === 0) && (
            <Image 
              source={{ uri: recipe.ai_image_url }} 
              style={styles.recipeImage}
            />
          )}

          {/* User Images */}
          {images?.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image 
                source={{ uri: image }} 
                style={styles.recipeImage}
              />
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => removeImage(index)}
              >
                <MaterialIcons name="close" size={24} color="#793206" />
              </TouchableOpacity>
            </View>
          ))}
          
          {/* Upload Photo Button */}
          <TouchableOpacity style={styles.uploadButton} onPress={imagePicker}>
            <MaterialIcons name="add-a-photo" size={24} color="#793206" />
          </TouchableOpacity>
        </ScrollView>

        <Divider />

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (only for you)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="How did it turn out? Would you change anything next time?"
            placeholderTextColor="#79320680"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Divider />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.logButton, isSubmitting && styles.disabledButton]} 
            onPress={handleNewLog}
            disabled={isSubmitting}
          >
            <Text style={styles.logButtonText}>
              {isSubmitting ? 'Saving...' : 'Log'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.discardButton} 
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.discardButtonText}>Discard Meal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#793206',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#793206',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    textAlignVertical: 'top',
    color: '#793206',
  },
  imagesContainer: {
    paddingVertical: 12,
  },
  imagesContentContainer: {
    gap: 16,
    alignItems: 'center',
  },
  recipeImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 1,
    // borderWidth: 1,
    // borderColor: '#79320633',
  },
  uploadButton: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#79320633',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionButtons: {
    gap: 12,
    marginTop: 12,
  },
  discardButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: '#793206',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
