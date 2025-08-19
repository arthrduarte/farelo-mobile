export const RECIPE_KEYS = {
  all: ['recipes'] as const,
  lists: () => [...RECIPE_KEYS.all, 'list'] as const,
  list: (profileId: string) => [...RECIPE_KEYS.lists(), profileId] as const,
  details: () => [...RECIPE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RECIPE_KEYS.details(), id] as const,
  search: (searchTerm?: string) => [...RECIPE_KEYS.lists(), { searchTerm }] as const,
  infinite: (searchTerm?: string) => [...RECIPE_KEYS.all, 'infinite', { searchTerm }] as const,
};
