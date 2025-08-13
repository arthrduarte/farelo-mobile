import { useMutation } from '@tanstack/react-query';
import { changeEmail, type ChangeEmailParams } from '@/actions/auth/changeEmail';

export const useChangeEmail = () => {
  return useMutation({
    mutationFn: changeEmail,
  });
};
