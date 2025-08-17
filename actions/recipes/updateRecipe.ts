import { updateRecipe } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Update an existing recipe
 */
export const updateRecipeAction = async (recipe: Recipe): Promise<Recipe> => {
  return await updateRecipe(recipe);
};
