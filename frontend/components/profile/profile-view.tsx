'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Instagram, Twitter, ExternalLink, Heart } from 'lucide-react';
import { Trophy, FolderHeart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { userApi } from '@/app/api/userApi'; // adjust path

interface ProfileViewProps {
  isPublic?: boolean;
  userId?: string;
}

export function ProfileView({ isPublic = false, userId }: ProfileViewProps) {
  const { data: userResponse, isLoading, isError } = userApi.useGetCurrentUserQuery();

  const user = userResponse?.user;

  // Placeholder favs data (filtered by rating sub-tabs later)
  const favArtworks = [
    {
      id: '1',
      title: 'Ankhon Dekhi Inspired Art',
      poster: '/placeholder.svg?height=200&width=140',
      rating: 'Perfection',
      review:
        'This artwork is an eye-opener for creative living. I was inspired as a kid when this style emerged but ill promise myself that when ill make my own theater ill screen it for 2 days just for myself.',
      likes: 42,
      comments: 8,
    },
    {
      id: '2',
      title: 'Border 2 Fan Poster',
      poster: '/placeholder.svg?height=200&width=140',
      rating: 'Timeless',
      review: 'PATHETIC MOVIE but still enjoyed my time. No comparison with original BORDER',
      likes: 19,
      comments: 5,
    },
    // Add more entries with different ratings: Skip, Go For It, etc.
  ];

  const contests = [
    {
      id: 'c1',
      title: 'Ramayana Fan Art Contest',
      poster: '/placeholder.svg?height=140&width=100',
      status: 'Submitted • Pending',
    },
    {
      id: 'c2',
      title: 'Marvel Redesign Challenge',
      poster: '/placeholder.svg?height=140&width=100',
      status: 'Won 2nd Place',
    },
  ];

  const collections = [
    {
      id: 'col1',
      name: 'My Cyberpunk Vibes',
      count: 18,
      cover: '/placeholder.svg?height=140&width=100',
    },
    {
      id: 'col2',
      name: 'Saved from @PixelNinja',
      count: 12,
      cover: '/placeholder.svg?height=140&width=100',
    },
  ];

  if (isLoading) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />;
  if (isError || !user)
    return <p className="text-red-500 text-center py-20">Could not load profile</p>;

  const initials = user.username?.slice(0, 2).toUpperCase() || 'U';
  const displayName = user.username || user.email?.split('@')[0] || 'User';
  const handle = user.username ? `@${user.username}` : '';
  const role = user.role?.name || 'Artist';

  const twitter = user.profile?.twitter;
  const instagram = user.profile?.instagram;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 max-w-6xl mx-auto">
      {/* LEFT – Profile Info (sticky) */}
      <div className="lg:sticky lg:top-8 lg:h-fit space-y-6 order-2 lg:order-1">
        <div className="text-center lg:text-left">
          <Avatar className="mx-auto lg:mx-0 h-28 w-28 mb-4 ring-2 ring-background shadow-lg">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-lg text-muted-foreground mt-1">{handle}</p>
          <p className="text-base text-gray-600 mt-2 font-medium">{role}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center bg-muted/50 p-5 rounded-xl">
          <div>
            <div className="text-2xl font-bold">211</div>
            <div className="text-xs text-muted-foreground">Artworks</div>
          </div>
          <div>
            <div className="text-2xl font-bold">53</div>
            <div className="text-xs text-muted-foreground">Licenses</div>
          </div>
          <div>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Contests</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">Collections</div>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        <div className="space-y-2.5 text-sm">
          {twitter && (
            <Link href={twitter} className="flex items-center gap-2.5 hover:text-primary">
              <Twitter className="h-4 w-4" />{' '}
              {twitter.replace(/^https?:\/\/(www\.)?(twitter\.com\/|x\.com\/)?/, '@')}
            </Link>
          )}
          {instagram && (
            <Link href={instagram} className="flex items-center gap-2.5 hover:text-primary">
              <Instagram className="h-4 w-4" />{' '}
              {instagram.replace(/^https?:\/\/(www\.)?(instagram\.com\/)?/, '@')}
            </Link>
          )}
        </div>

        <p className="text-sm text-muted-foreground">13 Followers · 7 Following</p>

        {!isPublic && (
          <Link
            href="/profile/edit"
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
          >
            Edit Profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* RIGHT / MAIN – Tabs + Content */}
      <div className="space-y-10 order-1 lg:order-2">
        <Tabs defaultValue="favs">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-6">
            <TabsTrigger
              value="favs"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6"
            >
              <Heart className="mr-2 h-4 w-4" /> Favs
            </TabsTrigger>
            <TabsTrigger
              value="contests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6"
            >
              <Trophy className="mr-2 h-4 w-4" /> Contests
            </TabsTrigger>
            <TabsTrigger
              value="collections"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6"
            >
              <FolderHeart className="mr-2 h-4 w-4" /> Collections
            </TabsTrigger>
          </TabsList>

          {/* Favs – with sub-tabs for ratings */}
          <TabsContent value="favs" className="mt-2">
            <Tabs defaultValue="all">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-10 px-0 mb-6">
                <TabsTrigger
                  value="all"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-5"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="skip"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-5"
                >
                  Skip
                </TabsTrigger>
                <TabsTrigger
                  value="timeless"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-5"
                >
                  Timeless
                </TabsTrigger>
                <TabsTrigger
                  value="go-for-it"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-5"
                >
                  Go For It
                </TabsTrigger>
                <TabsTrigger
                  value="perfection"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary px-5"
                >
                  Perfection
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {favArtworks.map((art) => (
                  <Card
                    key={art.id}
                    className="overflow-hidden shadow-sm hover:shadow transition-shadow"
                  >
                    <CardContent className="p-5 flex gap-6">
                      <div className="relative h-44 w-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={art.poster} alt={art.title} fill className="object-cover" />
                        <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          {art.rating}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2">{art.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-4">{art.review}</p>
                        <div className="flex items-center gap-5 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" /> {art.likes}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">💬</span> {art.comments}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* You can add filtered content for other sub-tabs here */}
              {/* Example: <TabsContent value="perfection"> ... show only Perfection rated items </TabsContent> */}
            </Tabs>
          </TabsContent>

          {/* Contests section */}
          <TabsContent value="contests" className="space-y-6 mt-2">
            <h2 className="text-xl font-semibold mb-4">Contests</h2>
            {contests.map((contest) => (
              <Card key={contest.id} className="overflow-hidden shadow-sm">
                <CardContent className="p-5 flex gap-5">
                  <div className="relative h-36 w-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={contest.poster} alt={contest.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{contest.title}</h3>
                    <p className="text-sm mt-2 text-muted-foreground">{contest.status}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Collections section */}
          <TabsContent value="collections" className="space-y-6 mt-2">
            <h2 className="text-xl font-semibold mb-4">Collections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {collections.map((col) => (
                <Card key={col.id} className="overflow-hidden shadow-sm">
                  <CardContent className="p-4">
                    <div className="relative h-48 w-full rounded-lg overflow-hidden mb-3">
                      <Image src={col.cover} alt={col.name} fill className="object-cover" />
                    </div>
                    <h3 className="font-semibold">{col.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {col.count} items • {col.owner}
                    </p>
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
