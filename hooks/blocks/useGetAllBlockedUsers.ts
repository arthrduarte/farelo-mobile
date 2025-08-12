import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBlockedUsers } from '@/actions/blocks/getAllBlockedUsers';
import type { Profile } from '@/types/db';

export const useGetAllBlockedUsers = () => {
  const { profile } = useAuth();

  return useQuery<Profile[]>({
    queryKey: ['blocks', 'blockedUsers', profile?.id],
    queryFn: () => getAllBlockedUsers(profile!.id),
    enabled: !!profile?.id,
  });
};
