'use server';

import { revalidatePath } from 'next/cache';
import { getUserById, updateUser } from '@/lib/db/models/user';
import { uploadFile } from '@/lib/db/storage';
import { getSession } from '@/lib/auth';

interface ProfileUpdateData {
  name: string;
  bio?: string | null;
  website?: string | null;
  socialLinks?: {
    twitter?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    [key: string]: string | null | undefined;
  };
  profileImageUrl?: string | null;
}

// Helper: remove null/undefined keys from socialLinks
function cleanSocialLinks(
  links: Record<string, string | null | undefined> | undefined
): Record<string, string> | undefined {
  if (!links) return undefined;

  const cleaned: Record<string, string> = {};

  for (const [key, value] of Object.entries(links)) {
    if (typeof value === 'string' && value.trim() !== '') {
      cleaned[key] = value.trim();
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export async function updateUserProfile(data: ProfileUpdateData) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedUser = await updateUser(user.id, {
      name: data.name,
      bio: data.bio ?? null,
      website: data.website ?? null,
      socialLinks: cleanSocialLinks({
        ...(user.socialLinks || {}),
        ...(data.socialLinks || {}),
      }),
      profileImageUrl:
        data.profileImageUrl === null
          ? undefined
          : data.profileImageUrl !== undefined
          ? data.profileImageUrl
          : user.profileImageUrl,
    });

    if (!updatedUser) {
      return { success: false, error: 'Failed to update user' };
    }

    revalidatePath('/profile');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export async function uploadProfileImage(file: File) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Most common pattern: uploadFile accepts an options object
    const result = await uploadFile({
      buffer,
      path: `profile-images/${session.user.id}/${file.name}`,
      contentType: file.type,
      // Add any other required fields (e.g. acl: 'public-read', metadata: {...})
    });

    // Extract the URL – adjust .url to match your StoredFile type
    const url = typeof result === 'string' ? result : result?.url;
    if (!url || typeof url !== 'string') {
      throw new Error('Upload failed - no valid URL returned');
    }

    const user = await getUserById(session.user.id);
    if (user) {
      await updateUser(user.id, { profileImageUrl: url });
    }

    return { success: true, url };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
