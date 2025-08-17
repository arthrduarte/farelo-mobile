import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createRecipeAction } from '@/actions/recipes/createRecipe';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (
      recipeData: Omit<Recipe, 'id' | 'profile_id' | 'ai_image_url' | 'chat' | 'created_at'>,
    ) => {
      if (!profile) throw new Error('User not authenticated');
      return createRecipeAction(recipeData, profile.id);
    },
    onSuccess: (newRecipe) => {
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>(RECIPE_KEYS.list(newRecipe.profile_id), (oldRecipes) => {
        if (!oldRecipes) return [newRecipe];
        return [newRecipe, ...oldRecipes];
      });
    },
  });
};
