import { getRecipes } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Get recipes for a user with optional search functionality and pagination
 */
export const getRecipesAction = async (
  profileId: string,
  searchTerm?: string,
  limit: number = 10,
  offset: number = 0,
): Promise<Recipe[]> => {
  return await getRecipes(profileId, searchTerm, limit, offset);
};
