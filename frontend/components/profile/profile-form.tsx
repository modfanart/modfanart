'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ProfileImageUpload } from '@/components/profile/profile-image-upload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { updateUserProfile } from '@/lib/actions/profile-actions';
import { ProfileUpdateData } from '@/services/api/userApi';
// ─── Import RTK Query ────────────────────────────────────────────────
import { userApi } from '@/services/api/userApi'; // adjust path if needed
import { useUpdateProfileMutation } from '@/services/api/userApi'; // ← if you want to use mutation instead of server action

// If you're still using the server action, keep this import:

// Reuse the same schema (adjusted field names to match UserProfile)
const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(50, { message: 'Username must not be longer than 50 characters.' }),
  bio: z.string().max(500, { message: 'Bio must not be longer than 500 characters.' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  twitter: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  instagram: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch current user with RTK Query
  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError,
    error,
  } = userApi.useGetCurrentUserQuery();

  const user = userResponse?.user;

  // Local state for profile image (in case upload happens before submit)
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar_url || null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      website: user?.website || '',
      twitter: (user?.profile?.['twitter'] as string | undefined) || '',
      instagram: (user?.profile?.['instagram'] as string | undefined) || '',
    },
    mode: 'onChange',
  });

  // Re-set default values when user data arrives (important!)
  // This handles the case where query finishes after initial render
  if (user && !form.formState.isDirty) {
    // form.reset()
    form.reset({
      username: user?.username || '',
      bio: user?.bio || '',
      website: user?.website || '',
      twitter: (user?.profile?.['twitter'] as string | undefined) || '',
      instagram: (user?.profile?.['instagram'] as string | undefined) || '',
    });
  }

  // Optional: Use RTK mutation instead of server action
  // const [updateProfile, { isLoading: isMutating }] = useUpdateProfileMutation();

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      // now this works
      const profileData: ProfileUpdateData = {
        name: data.username.trim(),
        bio: data.bio?.trim() || null,
        website: data.website?.trim() || null,
        socialLinks: {
          twitter: data.twitter?.trim() || null, // ← null instead of undefined
          instagram: data.instagram?.trim() || null,
        },
        profileImageUrl: profileImage || null,
      };

      // Optional: clean empty social links (already handled in server action, but extra safety)
      if (!profileData.socialLinks?.twitter && !profileData.socialLinks?.instagram) {
        delete profileData.socialLinks;
      }

      const result = await updateUserProfile(profileData);

      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Loading / error states
  if (isUserLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (isError || !user) {
    return (
      <div className="p-6 text-destructive">
        Failed to load profile. {error ? String(error) : 'Please try again.'}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ProfileImageUpload
        currentImage={profileImage}
        onImageChange={setProfileImage}
        userInitials={user.username?.substring(0, 2).toUpperCase() || 'U'}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your username" {...field} />
                </FormControl>
                <FormDescription>This is your public username.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="resize-none min-h-[120px]"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Max 500 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
                <FormDescription>Your personal or portfolio website.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Social Links</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter / X</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
