import { updateUserEmail } from '@/services/auth';

export interface ChangeEmailParams {
  newEmail: string;
  currentEmail?: string;
}

export const changeEmail = async ({ newEmail, currentEmail }: ChangeEmailParams) => {
  if (!newEmail) {
    throw new Error('Please enter a new email address');
  }

  if (newEmail === currentEmail) {
    throw new Error('New email must be different from current email');
  }

  await updateUserEmail(newEmail);
};
