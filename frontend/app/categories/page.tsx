'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { useGetAllCategoriesQuery } from '@/services/api/categoriesApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Grid, Search } from 'lucide-react';

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useGetAllCategoriesQuery();

  const [search, setSearch] = useState('');

  // ✅ SAFE NORMALIZATION
  const categories = data?.categories ?? [];

  // ✅ A-Z SORT + SEARCH FILTER
  const filteredCategories = useMemo(() => {
    return categories
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.description?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, search]);

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="text-gray-600 mt-2">Explore different types of artworks and collections</p>
        </div>

        {/* 🔍 Search Bar */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <p className="text-red-600 font-medium">Failed to load categories</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-2">
              {search ? 'Try a different search term' : 'New categories will appear here soon.'}
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && filteredCategories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredCategories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </h2>

                      <Badge variant="secondary" className="text-xs">
                        Category
                      </Badge>
                    </div>

                    {cat.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
