import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Share, Alert, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useRef } from 'react';
import { Recipe } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { Feather, MaterialIcons } from '@expo/vector-icons';
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
import ChatBubble from '@/components/chat/ChatBubble';
import Drawer from '@/components/ui/Drawer';

export default function RecipeDetailsScreen() {
  const { recipeId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const deleteRecipeMutation = useDeleteRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleDelete = async (recipeToDelete: Recipe) => {
    try {
      await deleteRecipeMutation.mutateAsync(recipeToDelete);
      router.back();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const showDeleteConfirmation = () => {
    toggleDrawer();
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe?.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(recipe!)
        }
      ]
    );
  };

  const handleRemix = () => {
    toggleDrawer();
    setShowRemixModal(true);
  };

  const handleEdit = () => {
    toggleDrawer();
    router.push(`/recipe/${recipeId}/edit` as any);
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

  const drawerOptions = [
    {
      icon: 'refresh' as keyof typeof MaterialIcons.glyphMap,
      text: 'Remix',
      onPress: handleRemix,
    },
    {
      icon: 'edit' as keyof typeof MaterialIcons.glyphMap,
      text: 'Edit',
      onPress: handleEdit,
    },
    {
      icon: 'delete' as keyof typeof MaterialIcons.glyphMap,
      text: deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete',
      onPress: showDeleteConfirmation,
      disabled: deleteRecipeMutation.isPending,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <RemixModal
        visible={showRemixModal}
        onClose={() => setShowRemixModal(false)}
        recipe={recipe}
      />

      <ScreenHeader 
        title="Recipe Details" 
        showBackButton={true} 
        rightItem={
          <>
          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <TouchableOpacity style={styles.logButton} onPress={() => router.push({
              pathname: '/recipe/[recipeId]/finish',
              params: { recipeId: recipe.id }
            })}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Log</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDrawer}>
              <MaterialIcons name="more-vert" size={24} color="#793206" />
            </TouchableOpacity>
          </View>
          </>
        }
      />

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

        {/* Tags */}
        <TagsSection tags={recipe.tags} />

        {/* Recipe Image */}
        {recipe.user_image_url ? (
          <ImagesSection mainImage={recipe.user_image_url} />
        ) : (
          <ImagesSection mainImage={recipe.ai_image_url} />
        )}

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
      <Drawer
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        drawerAnimation={drawerAnimation}
        options={drawerOptions}
        title="Recipe Actions"
      />
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
  logButton: {
    backgroundColor: '#793206',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#793206',
    fontSize: 16,
    marginBottom: 16,
  },
});
