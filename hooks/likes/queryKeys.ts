export const LIKES_KEYS = {
  all: ['likes'] as const,
  lists: () => [...LIKES_KEYS.all, 'list'] as const,
  list: (logId: string) => [...LIKES_KEYS.lists(), logId] as const,
  details: () => [...LIKES_KEYS.all, 'detail'] as const,
  detail: (logId: string, profileId: string) =>
    [...LIKES_KEYS.details(), logId, profileId] as const,
};
