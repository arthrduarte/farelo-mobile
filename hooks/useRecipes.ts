import { useQuery } from '@tanstack/react-query';
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

export const useRecipe = (id: string) => {
    return useQuery({
        queryKey: RECIPE_KEYS.detail(id),
        queryFn: async () => {
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