export const LOG_KEYS = {
  all: ['logs'] as const,
  lists: () => [...LOG_KEYS.all, 'list'] as const,
  list: (filters: string) => [...LOG_KEYS.lists(), { filters }] as const,
  details: () => [...LOG_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LOG_KEYS.details(), id] as const,
  infinite: (type: 'feed' | 'profile', profileId?: string) =>
    [...LOG_KEYS.all, 'infinite', type, profileId] as const,
  infiniteFeed: (profileId?: string) => [...LOG_KEYS.infinite('feed', profileId)] as const,
  infiniteProfile: (profileId?: string) => [...LOG_KEYS.infinite('profile', profileId)] as const,
};
