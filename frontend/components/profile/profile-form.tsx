'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

// ✅ RTK Query hooks
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '@/services/api/userApi';

// ────────────────────────────────────────────────
// Validation Schema
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────
export function ProfileForm() {
  // ✅ Fetch current user
  const { data: userResponse, isLoading: isUserLoading, isError, error } = useGetCurrentUserQuery();

  const user = userResponse?.user;

  // ✅ RTK Mutation
  const [updateProfile, { isLoading: isMutating }] = useUpdateProfileMutation();

  // Profile image state
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      bio: '',
      website: '',
      twitter: '',
      instagram: '',
    },
    mode: 'onChange',
  });

  // ✅ Reset form when user loads
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        bio: user.bio || '',
        website: user.website || '',
        twitter: user.profile?.twitter || '',
        instagram: user.profile?.instagram || '',
      });

      setProfileImage(user.avatar_url || null);
    }
  }, [user, form]);

  // ────────────────────────────────────────────────
  // Submit Handler
  // ────────────────────────────────────────────────
  async function onSubmit(data: ProfileFormValues) {
    try {
      const payload = {
        // ⚠️ include only if backend supports username update
        username: data.username.trim(),

        bio: data.bio?.trim() || null,
        website: data.website?.trim() || null,

        // ⚠️ match backend field name
        avatar_url: profileImage || null,

        profile: {
          twitter: data.twitter?.trim() || null,
          instagram: data.instagram?.trim() || null,
        },
      };

      await updateProfile(payload).unwrap();

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
    }
  }

  // ────────────────────────────────────────────────
  // Loading / Error States
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <ProfileImageUpload
        currentImage={profileImage}
        onImageChange={setProfileImage}
        userInitials={user.username?.substring(0, 2).toUpperCase() || 'U'}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
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

          {/* Bio */}
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

          {/* Website */}
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

          {/* Social Links */}
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

          {/* Submit */}
          <Button type="submit" disabled={isMutating}>
            {isMutating ? 'Updating...' : 'Update profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
