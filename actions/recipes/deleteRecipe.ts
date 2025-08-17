import { deleteRecipe } from '@/services/recipes';

/**
 * Delete a recipe by ID
 */
export const deleteRecipeAction = async (recipeId: string): Promise<void> => {
  return await deleteRecipe(recipeId);
};
