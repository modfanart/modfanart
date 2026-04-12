'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Image as ImageIcon, Grid, Bookmark, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { useAuth } from '@/store/AuthContext';
// RTK Query
import {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  CollectionRow,
} from '@/services/api/collectionApi';

type Tab = 'discover' | 'my-collections' | 'saved';

const savedCollections: CollectionRow[] = [];

const Stat = ({ icon: Icon, value }: any) => (
  <div className="flex items-center gap-1.5 text-xs text-gray-500">
    <Icon className="h-3.5 w-3.5" />
    <span>{value}</span>
  </div>
);

export default function CollectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('my-collections');

  const {
    data: myCollectionsData,
    isLoading: myLoading,
    isError: myError,
  } = useGetCollectionsQuery(
    {
      owner_type: 'user',
      owner_id: user?.id!,
    },
    {
      skip: activeTab !== 'my-collections' || !user?.id,
    }
  );

  const {
    data: discoverData,
    isLoading: discoverLoading,
    isError: discoverError,
  } = useGetCollectionsQuery({}, { skip: activeTab !== 'discover' });

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
    if (!user?.id) return;

    try {
      await createCollection({
        name: 'New Collection ' + new Date().toLocaleDateString(),
        description: 'My new curated set',
        is_public: true,
        owner_type: 'user',
        owner_id: user.id,
      }).unwrap();

      toast({
        title: 'Collection created',
        description: 'Your collection is ready 🎉',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    { id: 'discover', label: 'Discover', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'my-collections', label: 'My Collections', icon: <Grid className="h-4 w-4" /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="h-4 w-4" /> },
  ];

  if (authLoading) {
    return (
      <LayoutWrapper>
        <div className="p-10">
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
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
                  onClick={() => setActiveTab(tab.id as Tab)}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="text-red-600 text-lg font-medium">Failed to load collections</p>
              <Button variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Grid className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Start your first collection</h3>
              <p className="text-gray-500 mb-6">
                Organize artworks you love into beautiful collections.
              </p>
              {activeTab === 'my-collections' && (
                <Button
                  onClick={handleCreateCollection}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Collection
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug || collection.id}`}
                  className="group block aspect-[3/4] rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-lg"
                >
                  <div className="relative h-3/4">
                    {collection.cover_image_url ? (
                      <Image
                        src={collection.cover_image_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{collection.name}</h3>

                    <div className="flex gap-4 mt-2">
                      <Stat icon={ImageIcon} value="? items" />
                      <Stat icon={Heart} value="0 likes" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
