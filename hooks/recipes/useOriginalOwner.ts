import { useQuery } from '@tanstack/react-query';
import { getProfileById } from '@/services/profile';
import type { Profile } from '@/types/db';

export const useOriginalOwner = (copiedFrom?: string | null) => {
  return useQuery({
    queryKey: ['original-owner', copiedFrom],
    queryFn: () => {
      if (!copiedFrom) return null;
      return getProfileById(copiedFrom);
    },
    enabled: !!copiedFrom,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
