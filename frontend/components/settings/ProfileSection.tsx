'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from '../../services/api/userApi';

// ── Better schema ────────────────────────────────────────
const profileFormSchema = z.object({
  username: z.string().min(2, { message: 'Minimum 2 characters' }).max(30),
  email: z.string().email({ message: 'Invalid email address' }),
  bio: z.string().max(160).optional(),
  twitter: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  github: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  // instagram: ..., etc.
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSection() {
  const { data, isLoading } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();

  const user = data?.user;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      twitter: '',
      github: '',
    },
    mode: 'onChange',
  });

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        twitter: user.profile?.twitter || '',
        // instagram: user.profile?.instagram || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Prepare payload – convert empty string → null for backend
      const payload: any = {
        bio: values.bio?.trim() || undefined,
        profile: {
          twitter: values.twitter?.trim() || null,
          github: values.github?.trim() || null,
          // instagram: values.instagram?.trim() || null,
        },
      };

      await updateProfile(payload).unwrap();

      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });

      // Optional: form.reset(values); // if you want to "commit" the new values
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(file).unwrap();
      toast({ title: 'Avatar updated successfully' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar().unwrap();
      toast({ title: 'Avatar removed' });
    } catch (err: any) {
      toast({
        title: 'Failed to remove avatar',
        description: err?.data?.message || 'Try again later.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Avatar Section */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.avatar_url ?? '/placeholder.svg'} alt="Profile picture" />
          <AvatarFallback className="text-2xl">
            {(user?.username?.[0] ?? '').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              JPG, GIF or PNG. Recommended size 400×400. Max 2MB.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <label>
                {isUploading ? 'Uploading...' : 'Change picture'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </Button>

            {user?.avatar_url && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={handleRemoveAvatar}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            )}
          </div>
        </div>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="yourusername" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormDescription>
                  Used for login, notifications and account recovery.
                </FormDescription>
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
                    placeholder="Tell something about yourself..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Max 160 characters. Markdown is supported.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter / X</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://x.com/username"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isUpdating || !form.formState.isDirty}>
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
