'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from '@/services/api/userApi';
import { useGetAllRolesQuery } from '@/services/api/rolesApi';
import { useToast } from '@/components/ui/use-toast';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Trash2, Mail } from 'lucide-react';

// ───────────────────────────────
// Schema
// ───────────────────────────────
const formSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  status: z.enum(['active', 'suspended', 'pending_verification', 'deactivated']),
  role_id: z.string().min(1),
  profile: z
    .object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const { data: user, isLoading } = useGetUserByIdQuery(userId);
  const { data: roles = [] } = useGetAllRolesQuery();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadAvatar] = useUploadAvatarMutation();
  const [removeAvatar] = useRemoveAvatarMutation();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ───────────────────────────────
  // Form
  // ───────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: '',
      location: '',
      website: '',
      status: 'active',
      role_id: '',
      profile: {
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
      },
    },
  });

  // ───────────────────────────────
  // Hydrate form
  // ───────────────────────────────
  useEffect(() => {
    if (!user) return;

    form.reset({
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      status: user.status,
      role_id: user.role?.id || '',
      profile: {
        twitter: user.profile?.twitter || '',
        instagram: user.profile?.instagram || '',
        linkedin: user.profile?.linkedin || '',
        youtube: user.profile?.youtube || '',
      },
    });

    setAvatarPreview(user.avatar_url || null);
  }, [user, form]);

  // ───────────────────────────────
  // Submit
  // ───────────────────────────────
  const onSubmit = async (values: FormValues) => {
    try {
      await updateUser({
        userId,
        bio: values.bio ?? null,
        location: values.location ?? null,
        website: values.website ?? null,
        status: values.status,
        role_id: values.role_id,
        profile: values.profile ?? {},
      }).unwrap();
      toast({
        title: 'User updated',
        description: 'Changes saved successfully',
      });

      router.back();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: err?.data?.message || 'Something went wrong',
      });
    }
  };

  // ───────────────────────────────
  // Avatar
  // ───────────────────────────────
  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadAvatar(file).unwrap();
      setAvatarPreview(res.avatar_url);

      toast({ title: 'Avatar updated' });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatar().unwrap();
    setAvatarPreview(null);
    toast({ title: 'Avatar removed' });
  };

  // ───────────────────────────────
  // Loading
  // ───────────────────────────────
  if (isLoading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!user) {
    return <div className="p-10 text-center">User not found</div>;
  }

  // ───────────────────────────────
  // UI
  // ───────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="container mx-auto py-10 max-w-5xl space-y-8">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit User</h1>
              <p className="text-muted-foreground">{user.username}</p>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            {/* ───────── GENERAL ───────── */}
            <TabsContent value="general" className="grid md:grid-cols-2 gap-6">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview ?? undefined} />
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <input type="file" onChange={handleAvatar} />

                  {avatarPreview && (
                    <Button type="button" variant="destructive" onClick={handleRemoveAvatar}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                    {user.email_verified && <Badge>Verified</Badge>}
                  </div>

                  {/* STATUS */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border p-2 rounded">
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending_verification">Pending</option>
                            <option value="deactivated">Deactivated</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* ROLE */}
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full border p-2 rounded">
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* BIO */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* LOCATION */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* WEBSITE */}
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ───────── SOCIAL ───────── */}
            <TabsContent value="social">
              <Card>
                <CardContent className="space-y-4 mt-4">
                  {['twitter', 'instagram', 'linkedin', 'youtube'].map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`profile.${key}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{key}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </Form>
  );
}
