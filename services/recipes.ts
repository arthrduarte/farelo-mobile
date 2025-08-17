import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/db';

// Get recipes for a user with optional search
export const getRecipes = async (profileId: string, searchTerm?: string): Promise<Recipe[]> => {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('profile_id', profileId);

  if (searchTerm && searchTerm.trim() !== '') {
    const cleanedSearchTerm = searchTerm.trim();
    // Case-insensitive search for title OR tags containing the searchTerm
    // For tags, we need to format the search term for array containment
    query = query.or(`title.ilike.%${cleanedSearchTerm}%,tags.cs.{${cleanedSearchTerm}}`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Recipe[];
};

// Get a single recipe by ID
export const getRecipe = async (id: string): Promise<Recipe> => {
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();

  if (error) throw error;
  return data as Recipe;
};

// Create a new recipe
export const createRecipe = async (
  recipeData: Omit<Recipe, 'id' | 'created_at'>,
): Promise<Recipe> => {
  const { data, error } = await supabase.from('recipes').insert(recipeData).select().single();

  if (error) throw error;
  return data as Recipe;
};

// Update an existing recipe
export const updateRecipe = async (recipe: Recipe): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipe)
    .eq('id', recipe.id)
    .select()
    .single();

  if (error) throw error;
  return data as Recipe;
};

// Delete a recipe
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

  if (error) throw error;
};

// Copy a recipe for a new user
export const copyRecipe = async (
  recipeIdToCopy: string,
  currentUserId: string,
): Promise<Recipe> => {
  // 1. Fetch the original recipe
  const { data: originalRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeIdToCopy)
    .single();

  if (fetchError) throw new Error(`Failed to fetch original recipe: ${fetchError.message}`);
  if (!originalRecipe) throw new Error('Original recipe not found');

  // 2. Prepare the new recipe data
  const newRecipeData: Omit<Recipe, 'id' | 'created_at'> = {
    profile_id: currentUserId,
    title: originalRecipe.title,
    description: originalRecipe.description,
    ai_image_url: originalRecipe.ai_image_url,
    time: originalRecipe.time,
    servings: originalRecipe.servings,
    ingredients: originalRecipe.ingredients,
    instructions: originalRecipe.instructions,
    tags: originalRecipe.tags,
    source_url: originalRecipe.source_url,
    user_image_url: originalRecipe.user_image_url,
    notes: '',
    chat: null,
  };

  // 3. Insert the new recipe
  const { data: newRecipe, error: insertError } = await supabase
    .from('recipes')
    .insert(newRecipeData)
    .select()
    .single();

  if (insertError) throw new Error(`Failed to copy recipe: ${insertError.message}`);
  return newRecipe as Recipe;
};
