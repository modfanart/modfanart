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
  Edit,
  Settings,
  Sparkles,
  Eye,
  Users,
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

import { useGetMyArtworksQuery, useGetArtworksByCreatorQuery } from '@/services/api/artworkApi';

interface ProfileViewProps {
  targetUsername: string;
}

export function ProfileView({ targetUsername }: ProfileViewProps) {
  const { data: currentData, isLoading: currentLoading } = useGetCurrentUserQuery();

  const {
    data: profileUser,
    isLoading: profileLoading,
    error: profileError,
  } = useGetUserByUsernameQuery(targetUsername, {
    skip: !targetUsername,
  });

  const currentUser = currentData?.user;

  const isOwnProfile = useMemo(() => {
    return currentUser?.username?.toLowerCase() === targetUsername?.toLowerCase();
  }, [currentUser?.username, targetUsername]);

  // ────────────────────────────────────────────────
  // ARTWORKS FETCH
  // ────────────────────────────────────────────────

  const { data: myArtworksData, isLoading: myArtworksLoading } = useGetMyArtworksQuery(undefined, {
    skip: !isOwnProfile,
  });

  const { data: creatorArtworksData, isLoading: creatorArtworksLoading } =
    useGetArtworksByCreatorQuery(
      {
        creatorId: profileUser?.id ?? '',
        limit: 12,
      },
      {
        skip: isOwnProfile || !profileUser?.id,
      }
    );

  const artworks = (isOwnProfile ? myArtworksData?.artworks : creatorArtworksData?.artworks) ?? [];

  const artworksLoading = isOwnProfile ? myArtworksLoading : creatorArtworksLoading;

  const isLoading = currentLoading || profileLoading;

  // ────────────────────────────────────────────────
  // STATES
  // ────────────────────────────────────────────────

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (profileError || !profileUser) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          @{targetUsername} not found
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    );
  }

  const profile = profileUser.profile ?? {};
  const initials = profileUser.username?.slice(0, 2).toUpperCase() || 'U';

  const stats = [
    {
      label: 'Artworks',
      value: profileUser.stats?.artworks_count ?? 0,
      icon: Sparkles,
    },
    {
      label: 'Followers',
      value: profileUser.stats?.followers_count ?? 0,
      icon: Users,
    },
    {
      label: 'Likes',
      value: profileUser.stats?.likes_received ?? 0,
      icon: Heart,
    },
    {
      label: 'Views',
      value: profileUser.stats?.views_received ?? 0,
      icon: Eye,
    },
  ];

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-10 max-w-7xl mx-auto">
      {/* LEFT PANEL */}
      <div className="space-y-6 lg:sticky lg:top-8">
        <div className="bg-gradient-to-br from-muted/40 to-muted/10 p-6 rounded-2xl border shadow-sm text-center lg:text-left">
          <Avatar className="h-28 w-28 mx-auto lg:mx-0 mb-4 ring-4 ring-background shadow-xl">
            <AvatarImage src={profileUser.avatar_url ?? undefined} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold">{profileUser.username}</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 rounded-xl bg-muted/40 border text-center">
                <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* BIO */}
        {profileUser.bio && (
          <div className="text-sm bg-muted/30 p-4 rounded-xl border">{profileUser.bio}</div>
        )}

        {/* SOCIAL */}
        <div className="space-y-2">
          {profile.twitter && (
            <a href={profile.twitter} target="_blank">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Twitter className="h-4 w-4" /> Twitter
              </Button>
            </a>
          )}

          {profile.instagram && (
            <a href={profile.instagram} target="_blank">
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
        <Tabs defaultValue="artworks">
          <TabsList className="mb-6">
            <TabsTrigger value="artworks">
              <Sparkles className="mr-2 h-4 w-4" />
              Artworks
            </TabsTrigger>
            <TabsTrigger value="contests">
              <Trophy className="mr-2 h-4 w-4" />
              Contests
            </TabsTrigger>
            <TabsTrigger value="collections">
              <FolderHeart className="mr-2 h-4 w-4" />
              Collections
            </TabsTrigger>
          </TabsList>

          {/* ARTWORKS */}
          <TabsContent value="artworks">
            {artworksLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No artworks yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((art) => (
                  <Link key={art.id} href={`/artwork/${art.id}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition cursor-pointer">
                      <div className="relative h-48">
                        <Image
                          src={art.thumbnail_url || art.file_url}
                          alt={art.title}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />

                        {art.status !== 'published' && (
                          <Badge className="absolute top-2 left-2 capitalize">
                            {art.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-1">{art.title}</h3>

                        {art.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {art.description}
                          </p>
                        )}

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            {art.favorites_count}
                          </span>

                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {art.views_count}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CONTESTS */}
          <TabsContent value="contests">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No contests yet.
              </CardContent>
            </Card>
          </TabsContent>

          {/* COLLECTIONS */}
          <TabsContent value="collections">
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No collections yet.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
