// app/user/[userId]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  UserProfile,
} from '@/services/api/userApi';

import { useToast } from '@/components/ui/use-toast';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Save,
  Upload,
  X,
  User,
  Mail,
  Globe,
  MapPin,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Trash2,
} from 'lucide-react';

// ── Validation Schema ────────────────────────────────────────────────
const formSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url({ message: 'Invalid URL' }).or(z.literal('')).optional(),
  profile: z
    .object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
      // add more as needed
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const { data: user, isLoading: isLoadingUser } = useGetUserByIdQuery(userId);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemovingAvatar }] = useRemoveAvatarMutation();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: '',
      location: '',
      website: '',
      profile: {
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
      },
    },
  });

  // Fill form when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        profile: {
          twitter: user.profile?.twitter || '',
          instagram: user.profile?.instagram || '',
          linkedin: user.profile?.linkedin || '',
          youtube: user.profile?.youtube || '',
        },
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: any = {
        bio: values.bio ?? null,
        location: values.location ?? null,
        website: values.website ?? null,
      };

      if (values.profile) {
        payload.profile = values.profile;
      }

      await updateProfile(payload).unwrap();

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully saved.',
      });

      router.push(`/user/${userId}`);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.data?.message || 'Something went wrong.',
      });
    }
  };

  // ── Avatar Upload / Remove ───────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const result = await uploadAvatar(file).unwrap();
      setAvatarPreview(result.avatar_url);
      toast({ title: 'Avatar updated' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Avatar upload failed',
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar().unwrap();
      setAvatarPreview(null);
      toast({ title: 'Avatar removed' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to remove avatar',
      });
    }
  };

  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">User not found</h2>
        <Button className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your public profile information</p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isUpdating || !form.formState.isDirty}
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── GENERAL TAB ──────────────────────────────────────────────── */}
        <TabsContent value="general">
          <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
            {/* Avatar Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your public avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarPreview ?? undefined} alt={user.username} />
                    <AvatarFallback className="text-5xl bg-primary/10">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {avatarPreview && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8"
                      onClick={handleRemoveAvatar}
                      disabled={isRemovingAvatar}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    id="avatar-upload"
                    onChange={handleAvatarChange}
                  />
                  <Button variant="outline" className="w-full" asChild disabled={isUploadingAvatar}>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload New Avatar
                        </>
                      )}
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    PNG, JPG or WebP • Max 5MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Info Form */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Public details shown on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <FormLabel>Username</FormLabel>
                        <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted">
                          <span className="text-muted-foreground">@</span>
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                          {user.email_verified && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell others about yourself — your art style, interests, inspirations..."
                              className="min-h-[120px]"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormDescription>Max 500 characters</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Delhi, India"
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
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personal Website / Portfolio</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourportfolio.com"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── SOCIAL LINKS TAB ─────────────────────────────────────────── */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Connections</CardTitle>
              <CardDescription>Link your social profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="profile.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Twitter / X
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="@yourhandle" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="@yourhandle" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profile.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </FormLabel>
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

                  <FormField
                    control={form.control}
                    name="profile.youtube"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          YouTube
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://youtube.com/@yourchannel"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECURITY TAB (placeholder) ──────────────────────────────── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Authentication</CardTitle>
              <CardDescription>Manage password and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  You can change your password from the security settings page.
                </p>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Email Verification</h3>
                <div className="flex items-center gap-3">
                  <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                    {user.email_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                  {!user.email_verified && (
                    <Button variant="outline" size="sm">
                      Resend Verification Email
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating save bar */}
      {form.formState.isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50">
          <p className="text-sm font-medium">You have unsaved changes</p>
          <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}
