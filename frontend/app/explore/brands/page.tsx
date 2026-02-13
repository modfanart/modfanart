'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetAllBrandsQuery } from '@/services/api/brands';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Eye } from 'lucide-react';

const LIMIT = 12;

export default function ExploreBrandsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'followers_count' | 'views_count' | 'created_at' | 'name'>(
    'followers_count'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching } = useGetAllBrandsQuery({
    search,
    sortBy,
    sortOrder,
    limit: LIMIT,
    offset,
    status: 'active',
  });

  const brands = data?.brands || [];
  const hasMore = data?.pagination?.hasMore;

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Explore Brands</h1>
            <p className="text-muted-foreground mt-2">
              Discover verified brands collaborating with creators.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setOffset(0);
                setSearch(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-10">
          <Select
            value={sortBy}
            onValueChange={(value: any) => {
              setOffset(0);
              setSortBy(value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="followers_count">Most Followers</SelectItem>
              <SelectItem value="views_count">Most Viewed</SelectItem>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value: any) => {
              setOffset(0);
              setSortOrder(value);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="rounded-2xl p-6 space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </Card>
            ))}
          </div>
        )}

        {/* Brands Grid */}
        {!isLoading && (
          <>
            {brands.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No brands found.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {brands.map((brand) => (
                  <Link key={brand.id} href={`/brands/${brand.slug}`}>
                    <Card className="rounded-2xl hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                      {brand.banner_url && (
                        <div className="h-24 w-full overflow-hidden">
                          <img
                            src={brand.banner_url}
                            alt={brand.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          {brand.logo_url && (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="h-12 w-12 rounded-lg object-cover border"
                            />
                          )}

                          <div>
                            <h3 className="font-semibold line-clamp-1">{brand.name}</h3>

                            <Badge variant="secondary" className="mt-1">
                              Active
                            </Badge>
                          </div>
                        </div>

                        {brand.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {brand.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {brand.followers_count}
                          </div>

                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {brand.views_count}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {brands.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  disabled={offset === 0 || isFetching}
                  onClick={() => setOffset((prev) => Math.max(prev - LIMIT, 0))}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={!hasMore || isFetching}
                  onClick={() => setOffset((prev) => prev + LIMIT)}
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
