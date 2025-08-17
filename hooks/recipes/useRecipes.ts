import { useQuery } from '@tanstack/react-query';
import { getRecipesAction } from '@/actions/recipes/getRecipes';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useRecipes = (profileId: string | undefined, searchTerm?: string) => {
  return useQuery<Recipe[]>({
    queryKey: RECIPE_KEYS.search(searchTerm),
    queryFn: () => getRecipesAction(profileId!, searchTerm),
    enabled: !!profileId,
  });
};
