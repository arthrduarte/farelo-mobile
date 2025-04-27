import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types/db';

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