'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetAllUsersQuery } from '../../../../services/api/userApi';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function ExploreArtistsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page,
    limit: 12,
    search,
    // backend should filter by role
    // if your backend supports it:
    // role: "artist"
  });

  const artists = data?.users?.filter((user) => user.role?.name === 'artist') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Explore Artists</h1>
            <p className="text-muted-foreground mt-2">
              Discover talented creators and licensed fan artists.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artists..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-2xl p-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-32 mx-auto" />
              </Card>
            ))}
          </div>
        )}

        {/* Artists Grid */}
        {!isLoading && (
          <>
            {artists.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No artists found.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {artists.map((artist) => (
                  <Link key={artist.id} href={`/u/${artist.username}`}>
                    <Card className="rounded-2xl hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-6 text-center space-y-4">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarImage src={artist.avatar_url || undefined} />
                          <AvatarFallback>
                            {artist.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h3 className="font-semibold">@{artist.username}</h3>
                          {artist.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {artist.bio}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {data?.pagination && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  disabled={!data.pagination.has_prev || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {data.pagination.page} of {data.pagination.total_pages}
                </span>

                <Button
                  variant="outline"
                  disabled={!data.pagination.has_next || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
