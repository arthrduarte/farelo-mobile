import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBlockedIds } from '@/actions/blocks/getAllBlockedIds';

export const useGetAllBlockedIds = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['blocks', 'blockedIds', profile?.id],
    queryFn: () => getAllBlockedIds(profile!.id),
    enabled: !!profile?.id,
  });
};
