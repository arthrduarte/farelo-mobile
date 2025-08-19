import { getRecipe } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Get a single recipe by ID
 */
export const getRecipeAction = async (id: string): Promise<Recipe> => {
  return await getRecipe(id);
};
