import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecipeAction } from '@/actions/recipes/getRecipe';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useRecipe = (id: string, profileId?: string) => {
  const queryClient = useQueryClient();

  return useQuery<Recipe>({
    queryKey: RECIPE_KEYS.detail(id),
    queryFn: async () => {
      // First try to get from the recipes list cache
      const recipes = queryClient.getQueryData<Recipe[]>(RECIPE_KEYS.list(profileId || ''));
      const cachedRecipe = recipes?.find((recipe) => recipe.id === id);

      if (cachedRecipe) {
        return cachedRecipe;
      }

      // If not in cache, fetch individually
      return await getRecipeAction(id);
    },
  });
};
