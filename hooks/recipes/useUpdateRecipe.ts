import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRecipeAction } from '@/actions/recipes/updateRecipe';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: Recipe) => updateRecipeAction(recipe),
    onSuccess: (updatedRecipe) => {
      // Update both the list and detail cache
      queryClient.setQueryData(RECIPE_KEYS.detail(updatedRecipe.id), updatedRecipe);

      // Update the recipe in the list cache
      queryClient.setQueryData<Recipe[]>(
        RECIPE_KEYS.list(updatedRecipe.profile_id),
        (oldRecipes) => {
          if (!oldRecipes) return [updatedRecipe];
          return oldRecipes.map((recipe) =>
            recipe.id === updatedRecipe.id ? updatedRecipe : recipe,
          );
        },
      );
    },
  });
};
