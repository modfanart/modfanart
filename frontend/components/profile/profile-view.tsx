'use client';

import { useMemo } from 'react';
import {
  Instagram,
  Twitter,
  Heart,
  Trophy,
  FolderHeart,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Settings,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useGetCurrentUserQuery, useGetUserByUsernameQuery } from '@/services/api/userApi';

interface ProfileViewProps {
  targetUsername: string;
}

export function ProfileView({ targetUsername }: ProfileViewProps) {
  const { data: currentData, isLoading: currentLoading } = useGetCurrentUserQuery();
  const { data: profileData, isLoading: profileLoading } = useGetUserByUsernameQuery(
    targetUsername,
    {
      skip: !targetUsername,
    }
  );

  const currentUser = currentData?.user;
  const profileUser = profileData?.user;

  const isLoading = currentLoading || profileLoading;

  const isOwnProfile = useMemo(() => {
    return currentUser?.username?.toLowerCase() === targetUsername?.toLowerCase();
  }, [currentUser?.username, targetUsername]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          @{targetUsername} not found
        </h2>
      </div>
    );
  }

  const initials = profileUser.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-10 max-w-7xl mx-auto">
      {/* LEFT PANEL */}
      <div className="space-y-6 lg:sticky lg:top-8">
        {/* PROFILE CARD */}
        <div className="bg-gradient-to-br from-muted/40 to-muted/10 p-6 rounded-2xl border shadow-sm text-center lg:text-left">
          <Avatar className="h-28 w-28 mx-auto lg:mx-0 mb-4 ring-4 ring-background shadow-xl">
            <AvatarImage src={profileUser.avatar_url ?? undefined} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold">{profileUser.username}</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>

          <Badge className="mt-3 px-3 py-1">{profileUser.role?.name}</Badge>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Artworks', value: 248 },
            { label: 'Licenses', value: 67 },
            { label: 'Contests', value: 4 },
            { label: 'Collections', value: 9 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-muted/40 border text-center hover:shadow-sm transition"
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* BIO */}
        {profileUser.bio && (
          <div className="text-sm bg-muted/30 p-4 rounded-xl border">{profileUser.bio}</div>
        )}

        {/* SOCIAL */}
        <div className="space-y-2">
          {profileUser.profile?.twitter && (
            <a href={profileUser.profile.twitter} target="_blank">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Twitter className="h-4 w-4" /> Twitter
              </Button>
            </a>
          )}
          {profileUser.profile?.instagram && (
            <a href={profileUser.profile.instagram} target="_blank">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Button>
            </a>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <Button asChild className="flex-1">
                <Link href="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1">
                <UserPlus className="mr-2 h-4 w-4" />
                Follow
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div>
        <Tabs defaultValue="favs">
          <TabsList className="mb-6">
            <TabsTrigger value="favs">
              <Heart className="mr-2 h-4 w-4" /> Favs
            </TabsTrigger>
            <TabsTrigger value="contests">
              <Trophy className="mr-2 h-4 w-4" /> Contests
            </TabsTrigger>
            <TabsTrigger value="collections">
              <FolderHeart className="mr-2 h-4 w-4" /> Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favs">
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2].map((id) => (
                <Card key={id} className="overflow-hidden hover:shadow-md transition">
                  <div className="relative h-48">
                    <Image src="/placeholder.svg" alt="" fill className="object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Artwork Title</h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" /> 23
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> 5
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contests">
            <Card>
              <CardContent className="p-6 text-muted-foreground">No contests yet.</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <Card>
              <CardContent className="p-6 text-muted-foreground">No collections yet.</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
