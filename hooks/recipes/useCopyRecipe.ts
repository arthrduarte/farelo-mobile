import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { copyRecipeAction } from '@/actions/recipes/copyRecipe';
import { RECIPE_KEYS } from './queryKeys';
import type { Recipe } from '@/types/db';

export const useCopyRecipe = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: ({ recipeIdToCopy }: { recipeIdToCopy: string }) => {
      if (!profile) throw new Error('User not authenticated');
      return copyRecipeAction(recipeIdToCopy, profile.id);
    },
    onSuccess: (newRecipe) => {
      if (!profile) return;
      // Invalidate the current user's recipe list to refetch
      queryClient.invalidateQueries({
        queryKey: RECIPE_KEYS.list(profile.id),
      });
      router.push({
        pathname: '/recipe/[recipeId]/edit',
        params: { recipeId: newRecipe.id },
      });
    },
    onError: (error) => {
      console.error('Failed to copy recipe:', error.message);
    },
  });
};
