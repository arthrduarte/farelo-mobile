import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Recipe } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import DeleteModal from '@/components/recipe/DeleteModal';
import RemixModal from '@/components/recipe/RemixModal';
import { useRecipe, useDeleteRecipe, useUpdateRecipe } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { IngredientsSection } from '@/components/recipe/IngredientsSection';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InstructionsSection } from '@/components/recipe/InstructionsSection';
import { ImagesSection } from '@/components/recipe/RecipeImage';
import { NotesSection } from '@/components/recipe/NotesSection';
import { TagsSection } from '@/components/recipe/TagsSection';
import { Divider } from '@/components/Divider';
import ChatBubble from '@/components/ChatBubble';

export default function RecipeShareScreen() {
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

      <ScreenHeader title="Shared Recipe" showBackButton={true} />

      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
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

        {/* Recipe Image */}
        {recipe.user_image_url ? (
          <ImagesSection mainImage={recipe.user_image_url} />
        ) : (
          <ImagesSection mainImage={recipe.ai_image_url} />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
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
      <ChatBubble recipeId={recipe.id} />
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
