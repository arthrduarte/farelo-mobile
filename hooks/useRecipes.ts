import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export const RECIPE_KEYS = {
    all: ['recipes'] as const,
    lists: () => [...RECIPE_KEYS.all, 'list'] as const,
    list: (profileId: string) => [...RECIPE_KEYS.lists(), profileId] as const,
    details: () => [...RECIPE_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...RECIPE_KEYS.details(), id] as const,
};

export const useRecipes = (profileId: string | undefined) => {
    return useQuery({
        queryKey: RECIPE_KEYS.list(profileId || ''),
        queryFn: async () => {
            console.log("Querying recipes from supabase");
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .order('created_at', { ascending: false })
                .eq('profile_id', profileId);

            if (error) throw error;
            return data as Recipe[];
        },
        enabled: !!profileId,
    });
};

export const useRecipe = (id: string, profileId?: string) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: RECIPE_KEYS.detail(id),
        queryFn: async () => {
            // First try to get from the recipes list cache
            const recipes = queryClient.getQueryData<Recipe[]>(RECIPE_KEYS.list(profileId || ''));
            const cachedRecipe = recipes?.find(recipe => recipe.id === id);

            if (cachedRecipe) {
                console.log("Using recipe from cache");
                return cachedRecipe;
            }

            // If not in cache, fetch individually
            console.log("Querying recipe from supabase");
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Recipe;
        },
    });
};

export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recipe: Recipe) => {
            const { data, error } = await supabase
                .from('recipes')
                .update(recipe)
                .eq('id', recipe.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (updatedRecipe) => {
            // Update both the list and detail cache
            queryClient.setQueryData(
                RECIPE_KEYS.detail(updatedRecipe.id),
                updatedRecipe
            );

            // Update the recipe in the list cache
            queryClient.setQueryData<Recipe[]>(
                RECIPE_KEYS.list(updatedRecipe.profile_id),
                (oldRecipes) => {
                    if (!oldRecipes) return [updatedRecipe];
                    return oldRecipes.map(recipe =>
                        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
                    );
                }
            );
        },
    });
};

export const useDeleteRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recipe: Recipe) => {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', recipe.id);

            if (error) throw error;
            return recipe;
        },
        onSuccess: (deletedRecipe) => {
            // Remove from detail cache
            queryClient.removeQueries({
                queryKey: RECIPE_KEYS.detail(deletedRecipe.id)
            });

            // Remove from list cache
            queryClient.setQueryData<Recipe[]>(
                RECIPE_KEYS.list(deletedRecipe.profile_id),
                (oldRecipes) => {
                    if (!oldRecipes) return [];
                    return oldRecipes.filter(recipe => recipe.id !== deletedRecipe.id);
                }
            );
        },
    });
};

// New hook for copying a recipe
export const useCopyRecipe = () => {
    const queryClient = useQueryClient();
    const { profile } = useAuth(); // Get current user profile

    return useMutation({
        mutationFn: async ({ recipeIdToCopy }: { recipeIdToCopy: string }) => {
            if (!profile) throw new Error("User not authenticated");
            const currentUserId = profile.id;

            // 1. Fetch the original recipe
            const { data: originalRecipe, error: fetchError } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', recipeIdToCopy)
                .single();

            if (fetchError) {
                console.error("Error fetching original recipe:", fetchError);
                throw new Error(`Failed to fetch original recipe: ${fetchError.message}`);
            }
            if (!originalRecipe) {
                throw new Error("Original recipe not found");
            }

            // 2. Prepare the new recipe data
            const newRecipeData: Omit<Recipe, 'id' | 'created_at'> = {
                profile_id: currentUserId,
                title: originalRecipe.title,
                description: originalRecipe.description,
                ai_image_url: originalRecipe.ai_image_url, // Keep original AI image
                time: originalRecipe.time,
                servings: originalRecipe.servings,
                ingredients: originalRecipe.ingredients,
                instructions: originalRecipe.instructions,
                tags: originalRecipe.tags,
                source_url: originalRecipe.source_url, // Keep original source URL
                user_image_url: null, // Reset user image
                notes: '', // Reset notes
                chat: null, // Reset chat
            };

            // 3. Insert the new recipe
            const { data: newRecipe, error: insertError } = await supabase
                .from('recipes')
                .insert(newRecipeData)
                .select()
                .single();

            if (insertError) {
                console.error("Error inserting new recipe:", insertError);
                throw new Error(`Failed to copy recipe: ${insertError.message}`);
            }

            return newRecipe as Recipe;
        },
        onSuccess: (newRecipe) => {
            if (!profile) return; // Should not happen if mutationFn succeeded
            console.log("Recipe copied successfully:", newRecipe);
            // Invalidate the current user's recipe list to refetch
            queryClient.invalidateQueries({
                queryKey: RECIPE_KEYS.list(profile.id)
            });
            // Optional: Could potentially add the new recipe directly to the cache
            // queryClient.setQueryData<Recipe[]>(RECIPE_KEYS.list(profile.id), (oldData) => ...);
            router.push({
                pathname: '/recipe/[recipeId]/edit',
                params: { recipeId: newRecipe.id }
            });
        },
        onError: (error) => {
            console.error("Failed to copy recipe:", error.message);
            // Here you could trigger user feedback, e.g., a toast notification
        }
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    return useMutation({
        mutationFn: async (recipeData: Omit<Recipe, 'id' | 'profile_id' | 'ai_image_url' | 'user_image_url' | 'user_images_url' | 'chat'>) => {
            if (!profile) throw new Error("User not authenticated");

            const newRecipe = {
                ...recipeData,
                profile_id: profile.id,
                ai_image_url: '', // This will be updated later if AI generates an image
                user_image_url: null,
                user_images_url: null,
                chat: null,
            };

            const { data, error } = await supabase
                .from('recipes')
                .insert(newRecipe)
                .select()
                .single();

            if (error) {
                console.error("Error creating recipe:", error);
                throw error;
            }

            return data as Recipe;
        },
        onSuccess: (newRecipe) => {
            // Update the recipes list cache
            queryClient.setQueryData<Recipe[]>(
                RECIPE_KEYS.list(newRecipe.profile_id),
                (oldRecipes) => {
                    if (!oldRecipes) return [newRecipe];
                    return [newRecipe, ...oldRecipes];
                }
            );
        },
    });
}; 