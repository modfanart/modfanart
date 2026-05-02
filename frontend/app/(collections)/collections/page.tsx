'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Heart, Image as ImageIcon, Grid, Bookmark, Sparkles, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { useAuth } from '@/store/AuthContext';

import {
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  CollectionRow,
} from '@/services/api/collectionApi';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

type Tab = 'discover' | 'my-collections' | 'saved';

const savedCollections: CollectionRow[] = [];

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
        description: 'My curated artworks',
        is_public: true,
        owner_type: 'user',
        owner_id: user.id,
      }).unwrap();

      toast({
        title: 'Collection created',
        description: 'Your collection is ready 🎉',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'my-collections',
      label: 'My Collections',
      icon: <Grid className="h-4 w-4" />,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <Bookmark className="h-4 w-4" />,
    },
  ];

  if (authLoading) {
    return (
      <div className="p-10">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground mt-1">Curate and organize your favorite artworks</p>
          </div>

          {activeTab === 'my-collections' && (
            <Button
              onClick={handleCreateCollection}
              disabled={isCreating}
              className="bg-primary text-white shadow-md gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'New Collection'}
            </Button>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-3 border-b pb-3 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                'rounded-full px-5 py-2 flex items-center gap-2 text-sm',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-destructive text-lg font-medium">Failed to load collections</p>
            <Button variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-mod-lightPurple flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-primary" />
            </div>

            <h3 className="text-xl font-semibold">No collections yet</h3>

            <p className="text-muted-foreground mt-2 mb-6">Start building your personal gallery</p>

            {activeTab === 'my-collections' && (
              <Button onClick={handleCreateCollection} className="bg-primary text-white">
                Create your first collection
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug || collection.id}`}
                className="group"
              >
                <Card className="overflow-hidden rounded-2xl hover:shadow-xl transition-all duration-300">
                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden">
                    {collection.cover_image_url ? (
                      <Image
                        src={collection.cover_image_url}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-mod-gray">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    <Badge className="absolute top-3 left-3 bg-primary text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>

                  {/* CONTENT */}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{collection.name}</h3>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {collection.description || 'No description'}
                    </p>
                  </CardContent>

                  {/* FOOTER */}
                  <CardFooter className="px-4 pb-4 flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />0 items
                    </div>

                    <div className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />0
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
