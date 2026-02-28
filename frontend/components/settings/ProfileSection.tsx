'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

import {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from '../../services/api/userApi';

// ── Schema matching backend UserProfile ────────────────────────────────
const profileFormSchema = z.object({
  username: z.string().min(2, { message: 'Minimum 2 characters' }).max(30),
  email: z.string().email({ message: 'Invalid email address' }),
  bio: z.string().max(160, { message: 'Maximum 160 characters' }).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  twitter: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),

  instagram: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
  // Add more if needed: youtube, tiktok, facebook, etc.
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSection() {
  const { data, isLoading } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveAvatarMutation();

  const user = data?.user; // CurrentUserResponse shape

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      location: '',
      website: '',
      twitter: '',

      instagram: '',
      linkedin: '',
    },
    mode: 'onChange',
  });

  // Sync form values when user data is fetched
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        twitter: user.profile?.twitter || '',

        instagram: user.profile?.instagram || '',
        linkedin: user.profile?.linkedin || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Prepare payload exactly matching UpdateProfileRequest
      const payload = {
        username: values.username.trim(), // if backend allows username update (consider removing if not)
        bio: values.bio?.trim() || null,
        location: values.location?.trim() || null,
        website: values.website?.trim() || null,
        profile: {
          twitter: values.twitter?.trim() || null,
          instagram: values.instagram?.trim() || null,
          linkedin: values.linkedin?.trim() || null,
          // Add others if you expand the form
        },
      };

      await updateProfile(payload).unwrap();

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully saved.',
      });

      form.reset(values); // Optional: mark form as pristine after success
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: client-side size/type validation
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 2MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadAvatar(file).unwrap();
      toast({ title: 'Avatar updated' });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.data?.message || 'Failed to upload avatar.',
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
        description: err?.data?.message || 'Please try again.',
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
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={user?.avatar_url ?? '/avatars/placeholder.png'} alt={user?.username} />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {(user?.username?.[0] ?? '?').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3 flex-1">
          <div>
            <h3 className="font-medium text-lg">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Recommended: square image, 400×400 or larger. Max 2MB. Formats: JPG, PNG, GIF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <label className="cursor-pointer">
                {isUploading ? 'Uploading...' : 'Upload new picture'}
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
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleRemoveAvatar}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove picture'}
              </Button>
            )}
          </div>
        </div>
      </section>

      <hr className="border-border" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="yourusername" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name and unique identifier.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Used for login, notifications, and account recovery.
                    {/* Optional: add verify button if !user.email_verified */}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell the world a bit about yourself..."
                    className="min-h-[120px] resize-none"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Max 160 characters. Basic Markdown supported (bold, italics, links).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Optional — helps people connect locally.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://yourwebsite.com"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter / X</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://x.com/yourhandle"
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
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/yourhandle"
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
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/yourname"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={isUpdating || !form.formState.isDirty}
              className="min-w-[140px]"
            >
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
