'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useToast } from '@/components/ui/use-toast';

import { useCreateUserMutation } from '@/services/api/userApi';
import { useGetAllRolesQuery } from '@/services/api/rolesApi';

export default function AddUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [createUser, { isLoading }] = useCreateUserMutation();

  // ✅ FETCH ROLES FROM API
  const { data: roles = [], isLoading: rolesLoading } = useGetAllRolesQuery();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',

    bio: '',
    location: '',
    website: '',

    avatar_url: '',
    banner_url: '',

    twitter: '',
    instagram: '',
    linkedin: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.role_id) {
      toast({
        title: 'Please select a role',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createUser({
        username: form.username,
        email: form.email,
        password: form.password,

        // ⚠️ Adjust based on backend:
        role: form.role_id, // OR change to role_id if backend expects that

        bio: form.bio || null,
        location: form.location || null,
        website: form.website || null,

        avatar_url: form.avatar_url || null,
        banner_url: form.banner_url || null,

        profile: {
          twitter: form.twitter || null,
          instagram: form.instagram || null,
          linkedin: form.linkedin || null,
        },
      }).unwrap();

      toast({ title: 'User created successfully' });
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
          <CardDescription>Create a new platform user.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC */}

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

            {/* ✅ DYNAMIC ROLE DROPDOWN */}

            <div className="space-y-2">
              <Label>Role</Label>

              <Select
                value={form.role_id}
                onValueChange={(value) => setForm({ ...form, role_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={rolesLoading ? 'Loading roles...' : 'Select role'} />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <Input
                placeholder="Website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            {/* SOCIAL */}

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
                placeholder="LinkedIn"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              />
            </div>

            {/* ACTIONS */}

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
