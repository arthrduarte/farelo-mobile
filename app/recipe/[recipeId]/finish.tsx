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
import { Divider } from '@/components/Divider';
import * as ImagePicker from 'expo-image-picker';

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

    console.log(result);

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

      const updatedNotes = recipe.notes ? recipe.notes + " | " + notes : notes;

      // Update recipe with notes
      await updateRecipeMutation.mutateAsync({
        ...recipe,
        notes: updatedNotes,
      });

      // Create new log
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          profile_id: profile.id,
          recipe_id: recipe.id,
          description,
          images: [recipe.ai_image_url],
        });

      if (logError) throw Error(logError.message);

      // Use replace to prevent going back to the form
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving log:', error);
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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
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
    padding: 16,
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
