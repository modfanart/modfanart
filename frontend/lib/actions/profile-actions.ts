'use server';

import { revalidatePath } from 'next/cache';
import { getUserById, updateUser } from '@/lib/db/models/user';
import { uploadFile } from '@/lib/db/storage';
import { getSession } from '@/lib/auth';
import { User } from '@/lib/db/models/user';
import { ProfileUpdateData } from '@/services/api/userApi';

// Helper to clean social links: remove empty, null, or undefined values
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

/**
 * Update user profile (name, bio, website, social links, etc.)
 */
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

    // Build update object conditionally to satisfy exactOptionalPropertyTypes: true
    const updates: Partial<User> = {
      name: data.name,
    };

    // Bio: only include if non-null and non-empty
    if (data.bio !== undefined) {
      if (data.bio !== null && data.bio.trim() !== '') {
        updates.bio = data.bio.trim();
      }
      // null or empty → omit key (no change, since field is not nullable)
    }

    // Website: same logic
    if (data.website !== undefined) {
      if (data.website !== null && data.website.trim() !== '') {
        updates.website = data.website.trim();
      }
    }

    // Profile image URL: only update if a new URL is provided
    // Note: To remove the profile image, use a separate action (e.g., removeProfileImage)
    if (data.profileImageUrl !== undefined && data.profileImageUrl !== null) {
      updates.profileImageUrl = data.profileImageUrl;
    }

    // Social links
    if (data.socialLinks !== undefined) {
      const merged = {
        ...(user.socialLinks || {}),
        ...(data.socialLinks || {}),
      };

      const cleaned = cleanSocialLinks(merged);

      // Only include if there are valid links
      if (cleaned !== undefined) {
        updates.socialLinks = cleaned;
      }
      // If cleaned === undefined → user cleared all links → omit key = no change
      // To fully clear all links, add a separate "clearSocialLinks" field if needed
    }

    const updatedUser = await updateUser(user.id, updates);

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

/**
 * Upload a new profile image
 */
export async function uploadProfileImage(file: File) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadFile(buffer, {
      filename: file.name,
      contentType: file.type,
      folder: `profile-images/${session.user.id}`,
    });

    const url = typeof result === 'string' ? result : result?.url;

    if (!url || typeof url !== 'string') {
      throw new Error('Upload failed - no valid URL returned');
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Always set a real string → safe with exactOptionalPropertyTypes
    const updatedUser = await updateUser(user.id, {
      profileImageUrl: url,
    });

    if (!updatedUser) {
      return { success: false, error: 'Failed to update profile image' };
    }

    revalidatePath('/profile');
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
