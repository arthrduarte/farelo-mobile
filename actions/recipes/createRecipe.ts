import { createRecipe } from '@/services/recipes';
import type { Recipe } from '@/types/db';

/**
 * Create a new recipe with profile ID and default values
 */
export const createRecipeAction = async (
  recipeData: Omit<Recipe, 'id' | 'profile_id' | 'ai_image_url' | 'chat' | 'created_at'>,
  profileId: string,
): Promise<Recipe> => {
  const newRecipe = {
    ...recipeData,
    profile_id: profileId,
    ai_image_url: '', // This will be updated later if AI generates an image
    chat: null,
  };

  return await createRecipe(newRecipe);
};
