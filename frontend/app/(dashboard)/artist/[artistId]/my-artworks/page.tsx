'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { PlusCircle, Trash2, Eye, CheckCircle, XCircle, Clock, Trophy, Rocket } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import {
  useGetMyArtworksQuery,
  useDeleteArtworkMutation,
  usePublishArtworkMutation,
} from '@/services/api/artworkApi';

import { useGetMyContestEntriesQuery } from '@/services/api/contestsApi';

import type { ArtworkListItem } from '@/services/api/artworkApi';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

type StatusKey = 'published' | 'draft' | 'pending' | 'rejected' | 'archived' | 'winner';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const normalizeStatus = (status?: string): StatusKey => {
  if (!status) return 'draft';

  const s = status.toLowerCase();

  if (s === 'moderation_pending') return 'pending';

  if (
    s === 'published' ||
    s === 'draft' ||
    s === 'pending' ||
    s === 'rejected' ||
    s === 'archived' ||
    s === 'winner'
  ) {
    return s;
  }

  return 'draft';
};

const STATUS_MAP: Record<StatusKey, { label: string; className: string; icon: LucideIcon }> = {
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  draft: {
    label: 'Draft',
    className: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  pending: {
    label: 'Pending',
    className: 'bg-orange-100 text-orange-800',
    icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
  winner: {
    label: 'Winner',
    className: 'bg-amber-100 text-amber-800',
    icon: Trophy,
  },
};

// ────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────

const StatusUI = ({ status }: { status?: string }) => {
  const key = normalizeStatus(status);
  const { label, className, icon: Icon } = STATUS_MAP[key];

  return (
    <Badge className={`${className} flex gap-1 items-center w-fit`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// ────────────────────────────────────────────────

export default function ManageSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'draft' | 'pending' | 'published' | 'rejected' | 'in-contests'
  >('all');

  const { user, loading: authLoading } = useAuth();

  const { data: artworksData, isLoading: artworksLoading } = useGetMyArtworksQuery();

  const { data: entriesResponse, isLoading: entriesLoading } = useGetMyContestEntriesQuery();

  const [deleteArtwork] = useDeleteArtworkMutation();
  const [publishArtwork] = usePublishArtworkMutation();

  const artworks = artworksData?.artworks ?? [];
  const contestEntries = entriesResponse?.entries ?? [];

  const entryMap = useMemo(
    () => new Map(contestEntries.map((e) => [e.artwork_id, e])),
    [contestEntries]
  );

  const isLoading = authLoading || artworksLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const username = user.username?.toLowerCase() || 'anonymous';
  const artistBase = `/artist/${username}`;

  const unified = artworks.map((art: ArtworkListItem) => {
    const entry = entryMap.get(art.id);

    return {
      ...art,
      isContestSubmission: !!entry,
      contestTitle: entry?.contest_title,
      rank: entry?.rank,
    };
  });

  let displayed = unified;

  if (activeTab === 'in-contests') {
    displayed = unified.filter((i) => i.isContestSubmission);
  } else if (activeTab !== 'all') {
    displayed = unified.filter((i) => normalizeStatus(i.status) === activeTab);
  }

  const handleDelete = async (id: string) => {
    await deleteArtwork(id);
  };

  const handlePublish = async (id: string) => {
    await publishArtwork(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Artworks</h1>

        <Link href={`${artistBase}/my-artworks/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Artwork
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="in-contests">Contests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {displayed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No artworks found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {displayed.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition">
                  {/* Image */}
                  <div className="relative aspect-square">
                    <Image
                      src={item.thumbnail_url || item.file_url || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="space-y-2 pt-4">
                    <h3 className="font-semibold truncate">{item.title}</h3>

                    <StatusUI status={item.status} />
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="flex justify-between gap-2">
                    <Link href={`/artworks/${item.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {normalizeStatus(item.status) === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(item.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Rocket className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}

                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
