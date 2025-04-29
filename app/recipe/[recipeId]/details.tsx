import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Recipe } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import DeleteModal from '@/components/recipe/DeleteModal';
import RemixModal from '@/components/recipe/RemixModal';
import { PulsingPlaceholder } from '@/components/recipe/ImagePlaceholder';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRecipe, useDeleteRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { IngredientsSection } from '@/components/recipe/IngredientsSection';
import { InstructionsSection } from '@/components/recipe/InstructionsSection';
import { ImagesSection } from '@/components/recipe/ImagesSection';
import { NotesSection } from '@/components/recipe/NotesSection';
import { TagsSection } from '@/components/recipe/TagsSection';
import { Divider } from '@/components/Divider';
export default function RecipeDetailsScreen() {
  const { recipeId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const deleteRecipeMutation = useDeleteRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemixModal, setShowRemixModal] = useState(false);

  const handleDelete = async (recipeToDelete: Recipe) => {
    try {
      await deleteRecipeMutation.mutateAsync(recipeToDelete);
      router.back();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const handleRecipeUpdate = async (updatedRecipe: Recipe) => {
    try {
      await updateRecipeMutation.mutateAsync(updatedRecipe);
    } catch (err) {
      console.error('Error updating recipe:', err);
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
      <DeleteModal 
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete(recipe);
        }}
        recipe={recipe}
      />

      <RemixModal
        visible={showRemixModal}
        onClose={() => setShowRemixModal(false)}
        recipe={recipe}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.timeIcon}>
              <MaterialIcons name="schedule" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{recipe.time} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={styles.servingsIcon}>
              <MaterialIcons name="people" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>

        {/* Start Recipe Button */}
        <TouchableOpacity 
          style={styles.startRecipeButton} 
          onPress={() => router.push({
            pathname: '/[recipeId]/start',
            params: { recipeId: recipe.id }
          })}
        >
          <Text style={styles.startRecipeText}>Start Recipe</Text>
        </TouchableOpacity>

        {/* Recipe Image */}
        <ImagesSection mainImage={recipe.ai_image_url} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowRemixModal(true)}
          >
            <MaterialIcons name="refresh" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Remix</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/${recipeId}/edit` as any)}
          >
            <MaterialIcons name="edit" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <MaterialIcons name="delete" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <TagsSection tags={recipe.tags} />

        <Divider />

        {/* Ingredients */}
        <IngredientsSection ingredients={recipe.ingredients} />

        <Divider />

        {/* Instructions */}
        <InstructionsSection instructions={recipe.instructions} />

        <Divider />

        {/* Notes */}
        <NotesSection notes={recipe.notes} />

        <Divider />
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
    fontWeight: 'bold',
    color: '#793206',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 16,
    color: '#793206',
  },
  startRecipeButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  startRecipeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#793206',
    marginTop: 4,
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
  errorText: {
    color: '#793206',
    fontSize: 16,
    marginBottom: 16,
  },
});
