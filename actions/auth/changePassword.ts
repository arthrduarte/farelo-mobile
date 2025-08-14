import { verifyCurrentPassword, updateUserPassword } from '@/services/auth';

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  email: string;
}

export const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
  email,
}: ChangePasswordParams) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Please fill in all password fields');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match');
  }

  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }

  await verifyCurrentPassword(email, currentPassword);
  await updateUserPassword(newPassword);
};
