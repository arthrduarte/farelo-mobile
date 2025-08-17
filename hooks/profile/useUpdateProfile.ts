import { useMutation } from '@tanstack/react-query';
import { updateUserProfile, type UpdateProfileParams } from '@/actions/profile/updateProfile';

export const useUpdateProfile = () => {
  const mutation = useMutation({
    mutationFn: updateUserProfile,
  });

  return {
    mutate: mutation.mutate,
    result: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
