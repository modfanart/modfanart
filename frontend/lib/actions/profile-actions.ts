// 'use server';

// import { revalidatePath } from 'next/cache';
// import { getUserById, updateUser } from '@/lib/db/models/user';
// import { getSession } from '@/lib/auth';
// import { User } from '@/lib/db/models/user';
// import { ProfileUpdateData } from '@/services/api/userApi';

// // Clean social links (remove empty values)
// function cleanSocialLinks(
//   links: Record<string, string | null | undefined> | undefined
// ): Record<string, string> | undefined {
//   if (!links) return undefined;

//   const cleaned: Record<string, string> = {};

//   for (const [key, value] of Object.entries(links)) {
//     if (typeof value === 'string' && value.trim() !== '') {
//       cleaned[key] = value.trim();
//     }
//   }

//   return Object.keys(cleaned).length > 0 ? cleaned : undefined;
// }

// export async function updateUserProfile(data: ProfileUpdateData) {
//   try {
//     const session = await getSession();

//     if (!session?.user?.id) {
//       return { success: false, error: 'Not authenticated' };
//     }

//     const user = await getUserById(session.user.id);

//     if (!user) {
//       return { success: false, error: 'User not found' };
//     }

//     const updates: Partial<User> = {};

//     // ✅ Name (username)
//     if (data.name !== undefined) {
//       updates.name = data.name.trim();
//     }

//     // ✅ Bio (allow clearing)
//     if (data.bio !== undefined) {
//       updates.bio = data.bio && data.bio.trim() !== '' ? data.bio.trim() : null;
//     }

//     // ✅ Website (allow clearing)
//     if (data.website !== undefined) {
//       updates.website = data.website && data.website.trim() !== '' ? data.website.trim() : null;
//     }

//     // ✅ Profile Image (allow clearing)
//     if (data.profileImageUrl !== undefined) {
//       updates.profileImageUrl = data.profileImageUrl || null;
//     }

//     // ✅ Social Links
//     if (data.socialLinks !== undefined) {
//       const merged = {
//         ...(user.socialLinks || {}),
//         ...data.socialLinks,
//       };

//       const cleaned = cleanSocialLinks(merged);

//       // ✔ allow clearing all links
//       updates.socialLinks = cleaned || {};
//     }

//     const updatedUser = await updateUser(user.id, updates);

//     if (!updatedUser) {
//       return { success: false, error: 'Failed to update user' };
//     }

//     revalidatePath('/profile');

//     return {
//       success: true,
//       user: updatedUser,
//     };
//   } catch (error) {
//     console.error('Error updating profile:', error);

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'An unknown error occurred',
//     };
//   }
// }

// export async function uploadProfileImage(file: File) {
//   try {
//     const session = await getSession();

//     if (!session?.user?.id) {
//       return { success: false, error: 'Not authenticated' };
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     const result = await uploadFile(buffer, {
//       filename: file.name,
//       contentType: file.type,
//       folder: `profile-images/${session.user.id}`,
//     });

//     const url = typeof result === 'string' ? result : result?.url;

//     if (!url) {
//       throw new Error('Upload failed');
//     }

//     const user = await getUserById(session.user.id);

//     if (!user) {
//       return { success: false, error: 'User not found' };
//     }

//     await updateUser(user.id, {
//       profileImageUrl: url,
//     });

//     revalidatePath('/profile');

//     return { success: true, url };
//   } catch (error) {
//     console.error('Error uploading profile image:', error);

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Upload failed',
//     };
//   }
// }
