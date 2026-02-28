'use client';

import { useEffect, useMemo } from 'react';
import {
  Globe,
  Instagram,
  Twitter,
  ExternalLink,
  Heart,
  Trophy,
  FolderHeart,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useGetCurrentUserQuery,
  useGetUserByUsernameQuery,
  // If you add follow endpoint later:
  // useFollowUserMutation,
  // useUnfollowUserMutation,
} from '@/services/api/userApi';

interface ProfileViewProps {
  targetUsername: string;
}

export function ProfileView({ targetUsername }: ProfileViewProps) {
  // ── Current logged-in user ───────────────────────────────────────
  const {
    data: currentData,
    isLoading: currentLoading,
    isError: currentError,
  } = useGetCurrentUserQuery();

  const currentUser = currentData?.user;

  // ── Target profile ───────────────────────────────────────────────
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    isSuccess: profileSuccess,
  } = useGetUserByUsernameQuery(targetUsername, {
    skip: !targetUsername,
  });

  const profileUser = profileData?.user;

  const isLoading = currentLoading || profileLoading;
  const hasError = currentError || profileError || (!profileSuccess && !profileLoading);

  const isOwnProfile = useMemo(() => {
    if (!currentUser?.username || !targetUsername) return false;
    return currentUser.username.toLowerCase() === targetUsername.toLowerCase();
  }, [currentUser?.username, targetUsername]);

  // Placeholder / mock data ────────────────────────────────────────
  // In real app these would come from separate endpoints
  const favArtworks = [
    {
      id: '1',
      title: 'Ankhon Dekhi Inspired Art',
      poster: '/placeholder.svg?height=200&width=140',
      rating: 'Perfection',
      review: 'This artwork is an eye-opener for creative living. I was inspired as a kid...',
      likes: 42,
      comments: 8,
    },
    {
      id: '2',
      title: 'Border 2 Fan Poster',
      poster: '/placeholder.svg?height=200&width=140',
      rating: 'Timeless',
      review: 'PATHETIC MOVIE but still enjoyed my time...',
      likes: 19,
      comments: 5,
    },
  ];

  const contests = [
    { id: 'c1', title: 'Ramayana Fan Art Contest', status: 'Submitted • Pending' },
    { id: 'c2', title: 'Marvel Redesign Challenge', status: 'Won 2nd Place' },
  ];

  const collections = [
    { id: 'col1', name: 'My Cyberpunk Vibes', count: 18 },
    { id: 'col2', name: 'Saved from @PixelNinja', count: 12 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-10">
          <Skeleton className="h-96 w-full md:w-80 rounded-xl" />
          <div className="flex-1 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-muted-foreground">
          @{targetUsername} not found
        </h2>
        <p className="mt-3 text-muted-foreground">
          The profile may be private, suspended, or the username may be incorrect.
        </p>
      </div>
    );
  }

  const initials = profileUser.username?.slice(0, 2).toUpperCase() || 'U';
  const displayName = profileUser.username || 'User';
  const handle = profileUser.username ? `@${profileUser.username}` : '';
  const role = profileUser.role?.name || 'Artist';
  const bio = profileUser.bio;
  const twitter = profileUser.profile?.twitter;
  const instagram = profileUser.profile?.instagram;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 max-w-7xl mx-auto">
      {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-8 space-y-7 self-start">
        <div className="text-center lg:text-left">
          <Avatar className="mx-auto lg:mx-0 h-32 w-32 mb-5 ring-2 ring-background shadow-xl">
            <AvatarImage src={profileUser.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          <p className="text-xl text-muted-foreground mt-1">{handle}</p>

          {role && (
            <Badge variant="secondary" className="mt-3 px-4 py-1 text-sm">
              {role}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-center bg-muted/40 p-6 rounded-2xl border">
          <div>
            <div className="text-2xl font-bold">248</div>
            <div className="text-xs text-muted-foreground mt-1">Artworks</div>
          </div>
          <div>
            <div className="text-2xl font-bold">67</div>
            <div className="text-xs text-muted-foreground mt-1">Licenses</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground mt-1">Contests</div>
          </div>
          <div>
            <div className="text-2xl font-bold">9</div>
            <div className="text-xs text-muted-foreground mt-1">Collections</div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="bg-muted/30 p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap border">
            {bio}
          </div>
        )}

        {/* Social links */}
        <div className="space-y-2.5">
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
            >
              <Twitter className="h-4 w-4" />
              {twitter.replace(/^https?:\/\/(www\.)?(twitter\.com\/|x\.com\/)?/, '@')}
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
              {instagram.replace(/^https?:\/\/(www\.)?(instagram\.com\/)?/, '@')}
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          {isOwnProfile ? (
            <>
              <Button asChild className="flex-1 gap-2">
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1 gap-2">
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {!isOwnProfile && currentUser && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            Logged in as @{currentUser.username}
          </p>
        )}
      </div>

      {/* ── RIGHT COLUMN ── Tabs ───────────────────────────────────── */}
      <div className="space-y-10">
        <Tabs defaultValue="favs" className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-8">
            <TabsTrigger
              value="favs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-8 py-4 text-base"
            >
              <Heart className="mr-2 h-5 w-5" />
              Favs
            </TabsTrigger>
            <TabsTrigger
              value="contests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-8 py-4 text-base"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Contests
            </TabsTrigger>
            <TabsTrigger
              value="collections"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-8 py-4 text-base"
            >
              <FolderHeart className="mr-2 h-5 w-5" />
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favs">
            <div className="space-y-6">
              {favArtworks.map((art) => (
                <Card key={art.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-6">
                    <div className="relative h-48 w-36 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                      <Image src={art.poster} alt={art.title} fill className="object-cover" />
                      <Badge
                        variant="secondary"
                        className="absolute top-3 right-3 bg-purple-600 text-white hover:bg-purple-600"
                      >
                        {art.rating}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xl mb-3 line-clamp-2">{art.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                        {art.review}
                      </p>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" /> {art.likes}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" /> {art.comments}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contests">
            <div className="space-y-6">
              {contests.map((contest) => (
                <Card key={contest.id} className="overflow-hidden">
                  <CardContent className="p-6 flex gap-5">
                    <div className="relative h-40 w-28 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src="/placeholder.svg?height=160&width=112"
                        alt={contest.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{contest.title}</h3>
                      <p className="text-sm text-muted-foreground">{contest.status}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <Card key={col.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="relative h-52 w-full rounded-xl overflow-hidden mb-4">
                      <Image
                        src="/placeholder.svg?height=208&width=full"
                        alt={col.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">{col.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{col.count} items</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
