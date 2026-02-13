'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Image as ImageIcon, Grid, Bookmark, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { CollectionRow } from '@/services/api/collectionApi';
// RTK Query imports
import { useGetCollectionsQuery, useCreateCollectionMutation } from '@/services/api/collectionApi';
const savedCollections: CollectionRow[] = []; // ← explicit type
// You probably get current user from auth context / redux / cookie
// For demo — replace with real user data
const CURRENT_USER_ID = 'user-uuid-from-auth'; // ← replace with real value

type Tab = 'discover' | 'my-collections' | 'saved';

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('my-collections');

  // ────────────────────────────────────────────────
  // Queries depending on active tab
  // ────────────────────────────────────────────────
  const {
    data: myCollectionsData,
    isLoading: myLoading,
    isError: myError,
  } = useGetCollectionsQuery(
    { owner_type: 'user', owner_id: CURRENT_USER_ID },
    { skip: activeTab !== 'my-collections' }
  );

  // For "discover" — you can later add public collections query
  // For now we show the same data (or you can add a separate endpoint)
  const {
    data: discoverData,
    isLoading: discoverLoading,
    isError: discoverError,
  } = useGetCollectionsQuery(
    {}, // no filter → all public (depends on your backend)
    { skip: activeTab !== 'discover' }
  );

  // "Saved" can be a separate endpoint later (e.g. user favorites)
  const savedLoading = false;
  const savedError = false;

  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();

  const collections =
    activeTab === 'my-collections'
      ? (myCollectionsData?.collections ?? [])
      : activeTab === 'discover'
        ? (discoverData?.collections ?? [])
        : savedCollections;

  const isLoading =
    (activeTab === 'my-collections' && myLoading) ||
    (activeTab === 'discover' && discoverLoading) ||
    (activeTab === 'saved' && savedLoading);

  const isError =
    (activeTab === 'my-collections' && myError) ||
    (activeTab === 'discover' && discoverError) ||
    (activeTab === 'saved' && savedError);

  const handleCreateCollection = async () => {
    try {
      await createCollection({
        name: 'New Collection ' + new Date().toLocaleDateString(),
        description: 'My new curated set',
        is_public: true,
        owner_type: 'user',
        owner_id: CURRENT_USER_ID,
      }).unwrap();

      alert('Collection created!'); // ← replace with toast / modal
    } catch (err) {
      console.error('Failed to create collection:', err);
      alert('Failed to create collection');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'discover', label: 'Discover', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'my-collections', label: 'My Collections', icon: <Grid className="h-4 w-4" /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="h-4 w-4" /> },
  ];

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header + Tabs */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-gray-900">
                  Collections
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Curated sets of fan art, posters, edits and cinematic moments
                </p>
              </div>

              {/* Create button (visible on My Collections tab) */}
              {activeTab === 'my-collections' && (
                <Button
                  onClick={handleCreateCollection}
                  disabled={isCreating}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  {isCreating ? 'Creating...' : 'New Collection'}
                </Button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-1 mt-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Collections Grid / States */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm animate-pulse"
                >
                  <Skeleton className="h-full w-full rounded-b-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-red-600 text-lg font-medium">Failed to load collections</p>
              <Button variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : collections.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Grid className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No collections yet</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'my-collections'
                  ? 'Create your first collection to get started'
                  : activeTab === 'discover'
                    ? 'New public collections will appear here soon'
                    : 'You haven’t saved any collections yet'}
              </p>
              {activeTab === 'my-collections' && (
                <Button
                  onClick={handleCreateCollection}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Create your first collection
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug || collection.id}`}
                  className="group block aspect-[3/4] rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg hover:shadow-gray-200/70"
                >
                  {/* Cover Image */}
                  <div className="relative h-3/4 overflow-hidden">
                    {collection.cover_image_url ? (
                      <Image
                        src={collection.cover_image_url}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1.5 bg-white">
                    <h3 className="font-medium line-clamp-2 leading-tight text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {collection.name}
                    </h3>

                    <div className="flex items-center gap-5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>
                          {/* You would need item count from backend or separate query */}
                          {/* For now placeholder */}? items
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-100" />
                        <span>0 likes</span> {/* ← add real like count later */}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load more (can be replaced with infinite scroll later) */}
          {!isLoading && collections.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="gap-2 border-gray-300">
                Load More Collections
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
