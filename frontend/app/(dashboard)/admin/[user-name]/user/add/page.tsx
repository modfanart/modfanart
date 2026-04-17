'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/components/ui/use-toast';

import { useCreateUserMutation } from '@/services/api/userApi';

export default function AddUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [createUser, { isLoading }] = useCreateUserMutation();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',

    bio: '',
    location: '',
    website: '',

    avatar_url: '',
    banner_url: '',

    twitter: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        bio: form.bio,
        location: form.location,
        website: form.website,
        avatar_url: form.avatar_url,
        banner_url: form.banner_url,
        profile: {
          twitter: form.twitter,
          instagram: form.instagram,
          facebook: form.facebook,
          linkedin: form.linkedin,
          youtube: form.youtube,
          tiktok: form.tiktok,
        },
      }).unwrap();

      toast({
        title: 'User created successfully',
      });

      router.push('/users');
    } catch {
      toast({
        title: 'User creation failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add User
          </CardTitle>
          <CardDescription>
            Create a new platform user with full profile information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFO */}

            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* PROFILE */}

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
            </div>

            {/* IMAGES */}

            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Banner URL</Label>
              <Input
                value={form.banner_url}
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
              />
            </div>

            {/* SOCIAL LINKS */}

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Twitter"
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              />

              <Input
                placeholder="Instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />

              <Input
                placeholder="Facebook"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              />

              <Input
                placeholder="LinkedIn"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />

              <Input
                placeholder="YouTube"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              />

              <Input
                placeholder="TikTok"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
