import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/actions/auth/changePassword';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
