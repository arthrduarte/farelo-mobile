import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useRecipe, useUpdateRecipe } from '@/hooks/recipes';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Divider } from '@/components/Divider';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import 'react-native-url-polyfill/auto';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

export default function FinishRecipeScreen() {
  const { recipeId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const updateRecipeMutation = useUpdateRecipe();

  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const imagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const saveImage = async (image: string, profileId: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = image.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const contentType = `image/${fileExt}`;
      const fileName = `${profileId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('log.images')
        .upload(fileName, decode(base64), { contentType });

      if (uploadError) {
        console.error(`Supabase Upload Error for ${fileName}:`, uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('log.images').getPublicUrl(fileName);

      return publicUrl;
    } catch (fileProcessingError) {
      console.error(`Error processing or uploading file ${image}:`, fileProcessingError);
      throw fileProcessingError;
    }
  };

  const handleNewLog = async () => {
    if (!recipe || !profile) return;

    try {
      setIsSubmitting(true);

      let logImage: string;
      if (selectedImage) {
        logImage = await saveImage(selectedImage, profile.id);
      } else if (recipe.user_image_url) {
        logImage = recipe.user_image_url;
      } else {
        logImage = recipe.ai_image_url;
      }

      const updatedNotes = recipe.notes ? recipe.notes + ' | ' + notes : notes;
      await updateRecipeMutation.mutateAsync({
        ...recipe,
        notes: notes ? updatedNotes : recipe.notes,
      });

      const { error: logError } = await supabase.from('logs').insert({
        profile_id: profile.id,
        recipe_id: recipe.id,
        description: description || null,
        images: logImage ? [logImage] : [recipe.ai_image_url],
      });

      if (logError) {
        console.error('Supabase Insert Log Error:', logError);
        throw new Error(logError.message);
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in handleNewLog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <View style={styles.imagesContainer}>
            {selectedImage ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedImage }} style={styles.recipeImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <MaterialIcons name="close" size={20} color="#793206" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={imagePicker}>
                <MaterialIcons name="add-a-photo" size={24} color="#793206" />
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
                <Text style={{ fontSize: 14, color: '#79320680' }}>
                  If you don't upload a photo we'll use the recipe's image
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
              <Text style={styles.logButtonText}>{isSubmitting ? 'Saving...' : 'Log'}</Text>
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
      </KeyboardAvoidingView>
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
    width: '100%',
  },
  imagesContentContainer: {
    gap: 16,
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  uploadButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#79320633',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#79320633',
  },
  uploadButtonText: {
    color: '#793206',
    fontSize: 16,
    marginVertical: 12,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
    marginVertical: 12,
  },
  discardButton: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
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
