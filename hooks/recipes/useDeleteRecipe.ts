import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteRecipeAction } from '@/actions/recipes/deleteRecipe';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: Recipe) => deleteRecipeAction(recipe.id),
    onSuccess: (_, deletedRecipe) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: RECIPE_KEYS.detail(deletedRecipe.id),
      });

      // Remove from list cache
      queryClient.setQueryData<Recipe[]>(
        RECIPE_KEYS.list(deletedRecipe.profile_id),
        (oldRecipes) => {
          if (!oldRecipes) return [];
          return oldRecipes.filter((recipe) => recipe.id !== deletedRecipe.id);
        },
      );
    },
  });
};
