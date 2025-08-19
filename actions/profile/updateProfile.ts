import { checkUsernameAvailability, uploadProfileImage, updateProfile } from '@/services/profile';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,15}$/;

export interface UpdateProfileParams {
  userId: string;
  currentUsername: string;
  formData: {
    first_name: string;
    last_name: string | null;
    username: string;
  };
  selectedImage?: string | null;
  currentImage?: string;
}

export const updateUserProfile = async ({
  userId,
  currentUsername,
  formData,
  selectedImage,
  currentImage,
}: UpdateProfileParams) => {
  // Validate first name
  if (!formData.first_name.trim()) {
    throw new Error('First name is required');
  }

  // Validate username
  if (!formData.username.trim()) {
    throw new Error('Username cannot be empty');
  }

  if (!USERNAME_REGEX.test(formData.username)) {
    throw new Error(
      'Username must be 3-15 characters long and can only contain letters, numbers, and underscores',
    );
  }

  // Check username availability (only if username changed)
  if (formData.username !== currentUsername) {
    const isAvailable = await checkUsernameAvailability(formData.username, userId);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
  }

  // Upload image if new one selected
  let imageUrl = currentImage;
  if (selectedImage) {
    imageUrl = await uploadProfileImage(selectedImage, userId);
  }

  // Update profile
  await updateProfile(userId, {
    first_name: formData.first_name.trim(),
    last_name: formData.last_name?.trim() || null,
    username: formData.username.trim(),
    image: imageUrl,
  });
};
