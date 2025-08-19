import { useInfiniteQuery } from '@tanstack/react-query';
import { getRecipesAction } from '@/actions/recipes/getRecipes';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

const PAGE_SIZE = 10;

export const useInfiniteRecipes = (profileId: string | undefined, searchTerm?: string) => {
  return useInfiniteQuery<Recipe[], Error>({
    queryKey: RECIPE_KEYS.infinite(searchTerm),
    queryFn: ({ pageParam = 0 }) => {
      const offset = (pageParam as number) * PAGE_SIZE;
      return getRecipesAction(profileId!, searchTerm, PAGE_SIZE, offset);
    },
    enabled: !!profileId,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};
