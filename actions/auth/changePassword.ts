import { verifyCurrentPassword, updateUserPassword } from '@/services/auth';

export interface ChangePasswordParams {
  newPassword: string;
  confirmPassword: string;
  email: string;
}

export const changePassword = async ({
  newPassword,
  confirmPassword,
  email,
}: ChangePasswordParams) => {
  if (!newPassword || !confirmPassword) {
    throw new Error('Please fill in all password fields');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match');
  }

  // await verifyCurrentPassword(email, currentPassword);
  await updateUserPassword(newPassword);
};
