import { copyRecipe } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Copy a recipe to the current user's account
 */
export const copyRecipeAction = async (
  recipeIdToCopy: string,
  currentUserId: string,
): Promise<Recipe> => {
  return await copyRecipe(recipeIdToCopy, currentUserId);
};
