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
import { toast } from 'sonner';

// For demo – replace with real auth (e.g. from useSession, context, or cookies)
const CURRENT_USER_ID = 'user-uuid-from-auth'; // ← TODO: replace with actual user ID

type ViewMode = 'grid' | 'masonry';

// Define props with Promise (Next.js 15+ requirement for dynamic routes)
type Props = {
  params: Promise<{ collectionId: string }>;
};

export default function CollectionDetailPage({ params }: Props) {
  // Await params (safe even in client component – Next.js resolves it before render)
  // We use a state + effect pattern since we can't await top-level in client component
  const [collectionId, setCollectionId] = useState<string | null>(null);

  useEffect(() => {
    // Resolve the Promise once on mount
    params
      .then((resolved) => {
        setCollectionId(resolved.collectionId);
      })
      .catch((err) => {
        console.error('Failed to resolve collection params:', err);
        toast.error('Invalid collection URL');
      });
  }, [params]);

  // Skip query until we have a valid ID
  const { data, isLoading, isError, error } = useGetCollectionQuery(collectionId ?? '', {
    skip: !collectionId,
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
    if (!collection) return;
    try {
      await addArtwork({ collectionId: collection.id, artworkId }).unwrap();
      toast.success('Artwork added to collection');
    } catch {
      toast.error('Failed to add artwork');
    }
  };

  const handleRemoveArtwork = async (artworkId: string) => {
    if (!collection) return;
    if (!confirm('Remove this artwork from the collection?')) return;
    try {
      await removeArtwork({ collectionId: collection.id, artworkId }).unwrap();
      toast.success('Artwork removed');
    } catch {
      toast.error('Failed to remove artwork');
    }
  };

  // ────────────────────────────────────────────────
  // Early returns
  // ────────────────────────────────────────────────
  if (!collectionId) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading collection...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (isLoading || !data) {
    return <CollectionSkeleton />;
  }

  if (isError || !collection) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Collection not found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              It may have been deleted, made private, or the link may be incorrect.
            </p>
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
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-white/90 text-sm mb-3">
                  <VisibilityIcon className="h-4 w-4" />
                  <span>{visibilityText}</span>
                  <span>•</span>
                  <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  {collection.name}
                </h1>

                {collection.description && (
                  <p className="mt-4 text-lg text-white/80">{collection.description}</p>
                )}

                <div className="mt-5 flex items-center gap-6 text-white/80 text-sm">
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
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
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

        {/* Main content */}
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Curated Items</h2>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex bg-gray-100 rounded-full p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('rounded-full px-5', viewMode === 'grid' && 'bg-white shadow-sm')}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-full px-5',
                    viewMode === 'masonry' && 'bg-white shadow-sm'
                  )}
                  onClick={() => setViewMode('masonry')}
                >
                  Masonry
                </Button>
              </div>

              {isOwner && (
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                  <Plus className="h-4 w-4" />
                  Add Artwork
                </Button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-8">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 mb-4">This collection is empty</h3>
              <p className="text-gray-600 max-w-lg mx-auto mb-10">
                {isOwner
                  ? 'Start building your collection by adding your favorite artworks.'
                  : "The owner hasn't added any items to this collection yet."}
              </p>
              {isOwner && (
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
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
                  : 'columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-y-6'
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
// Artwork Card Component
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
  // TODO: In real app, fetch full artwork details using item.artwork_id
  // For now using placeholder
  const artwork = {
    id: item.artwork_id,
    title: `Artwork ${item.artwork_id.slice(0, 8)}...`,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3db7c6d659e?w=800',
    artist: 'Unknown Artist',
  };

  return (
    <div className="group relative break-inside-avoid mb-5">
      <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          width={600}
          height={800}
          className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 mb-1">
            {artwork.title}
          </h3>
          <p className="text-white/90 text-sm">{artwork.artist}</p>
        </div>

        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={onRemove}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Skeleton Loading State
// ────────────────────────────────────────────────
function CollectionSkeleton() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero skeleton */}
        <div className="h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between mb-12 gap-6">
            <div className="space-y-5 flex-1">
              <div className="h-12 w-3/4 bg-gray-300 rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-gray-300 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-gray-300 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
