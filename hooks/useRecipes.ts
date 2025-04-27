import { useQuery, useQueryClient } from '@tanstack/react-query';
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