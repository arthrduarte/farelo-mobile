import { getRecipes } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Get recipes for a user with optional search functionality
 */
export const getRecipesAction = async (
  profileId: string,
  searchTerm?: string,
): Promise<Recipe[]> => {
  return await getRecipes(profileId, searchTerm);
};
