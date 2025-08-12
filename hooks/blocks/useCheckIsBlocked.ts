import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { checkIsBlocked } from '@/actions/blocks';

export const useCheckIsBlocked = (userId?: string) => {
  const { profile } = useAuth();

  return useQuery<boolean>({
    queryKey: ['blocks', 'isBlocked', profile?.id, userId],
    queryFn: () => checkIsBlocked(profile!.id, userId!),
    enabled: !!profile?.id && !!userId,
  });
};
