// app/collections/[collectionId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Image as ImageIcon,
  Grid,
  Share2,
  Pencil,
  Trash2,
  Plus,
  Lock,
  Globe,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import {
  useGetCollectionQuery,
  useAddArtworkToCollectionMutation,
  useRemoveArtworkFromCollectionMutation,
  useUpdateCollectionMutation,
  CollectionRow,
  CollectionItemRow,
} from '@/services/api/collectionApi';
import { toast } from 'sonner'; // or your preferred toast library

// For demo – replace with real auth
const CURRENT_USER_ID = 'user-uuid-from-auth';

type ViewMode = 'grid' | 'masonry';

export default function CollectionDetailPage({ params }: { params: { collectionId: string } }) {
  const collectionId = params.collectionId;

  const { data, isLoading, isError, error } = useGetCollectionQuery(collectionId, {
    // You can skip if slug routing is used and you want to resolve slug → id first
  });

  const [updateCollection] = useUpdateCollectionMutation();
  const [addArtwork] = useAddArtworkToCollectionMutation();
  const [removeArtwork] = useRemoveArtworkFromCollectionMutation();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isOwner, setIsOwner] = useState(false);

  const collection = data?.collection;
  const items = data?.items ?? [];

  useEffect(() => {
    if (collection?.owner_id && collection.owner_type === 'user') {
      setIsOwner(collection.owner_id === CURRENT_USER_ID);
    }
  }, [collection]);

  const handleTogglePublic = async () => {
    if (!collection) return;
    try {
      await updateCollection({
        id: collection.id,
        is_public: !collection.is_public,
      }).unwrap();
      toast.success(`Collection is now ${collection.is_public ? 'private' : 'public'}`);
    } catch (err) {
      toast.error('Failed to update visibility');
    }
  };

  const handleAddArtwork = async (artworkId: string) => {
    try {
      await addArtwork({ collectionId: collection!.id, artworkId }).unwrap();
      toast.success('Artwork added to collection');
    } catch {
      toast.error('Failed to add artwork');
    }
  };

  const handleRemoveArtwork = async (artworkId: string) => {
    if (!confirm('Remove this artwork from the collection?')) return;
    try {
      await removeArtwork({ collectionId: collection!.id, artworkId }).unwrap();
      toast.success('Artwork removed');
    } catch {
      toast.error('Failed to remove artwork');
    }
  };

  if (isLoading) {
    return <CollectionSkeleton />;
  }

  if (isError || !collection) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Collection not found</h2>
            <p className="text-gray-600 mb-6">It may have been deleted or made private.</p>
            <Button asChild>
              <Link href="/collections">Back to Collections</Link>
            </Button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  const isPublic = collection.is_public;
  const VisibilityIcon = isPublic ? Globe : Lock;
  const visibilityText = isPublic ? 'Public' : 'Private';

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        {/* Hero / Header */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          {collection.cover_image_url ? (
            <Image
              src={collection.cover_image_url}
              alt={collection.name}
              fill
              className="object-cover brightness-[0.85]"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

          <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-10 md:pb-16">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
                  <VisibilityIcon className="h-4 w-4" />
                  <span>{visibilityText}</span>
                  <span>•</span>
                  <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {collection.name}
                </h1>

                {collection.description && (
                  <p className="mt-3 text-lg text-white/80 max-w-3xl">{collection.description}</p>
                )}

                <div className="mt-4 flex items-center gap-6 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    <span>{items.length} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>0 likes</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                      onClick={handleTogglePublic}
                    >
                      <VisibilityIcon className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Curated Items</h2>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-full p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('rounded-full px-4', viewMode === 'grid' && 'bg-white shadow-sm')}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full px-4',
                    viewMode === 'masonry' && 'bg-white shadow-sm'
                  )}
                  onClick={() => setViewMode('masonry')}
                >
                  Masonry
                </Button>
              </div>

              {isOwner && (
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                  Add Artwork
                </Button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <ImageIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">This collection is empty</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {isOwner
                  ? 'Start adding your favorite artworks to this collection.'
                  : "The owner hasn't added any items yet."}
              </p>
              {isOwner && (
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Add your first artwork
                </Button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-5 md:gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-5 md:gap-6'
              )}
            >
              {items.map((item: CollectionItemRow) => (
                <ArtworkCard
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  onRemove={() => handleRemoveArtwork(item.artwork_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}

// ────────────────────────────────────────────────
// Sub-component: single artwork card
// ────────────────────────────────────────────────
function ArtworkCard({
  item,
  isOwner,
  onRemove,
}: {
  item: CollectionItemRow;
  isOwner: boolean;
  onRemove: () => void;
}) {
  // In real app → you'd fetch artwork details by artwork_id
  // For now we simulate with placeholder
  const artwork = {
    id: item.artwork_id,
    title: `Artwork ${item.artwork_id.slice(0, 8)}`,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3db7c6d659e?w=800',
    artist: 'Unknown Artist',
  };

  return (
    <div className="group relative break-inside-avoid mb-5 md:mb-6">
      <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          width={600}
          height={800}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-medium line-clamp-2 mb-1">{artwork.title}</h3>
          <p className="text-white/80 text-sm">{artwork.artist}</p>
        </div>

        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Loading state
// ────────────────────────────────────────────────
function CollectionSkeleton() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero skeleton */}
        <div className="h-80 bg-gray-200 animate-pulse" />

        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between mb-10">
            <div className="space-y-4">
              <div className="h-10 w-3/5 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
