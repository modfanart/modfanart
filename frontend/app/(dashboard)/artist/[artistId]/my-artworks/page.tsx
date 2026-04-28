'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { PlusCircle, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { useGetMyArtworksQuery, useDeleteArtworkMutation } from '@/services/api/artworkApi';
import { useGetMyContestEntriesQuery } from '@/services/api/contestsApi';

import type { ArtworkListItem } from '@/services/api/artworkApi';

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const normalizeStatus = (status?: string) => {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s === 'moderation_pending') return 'pending';
  return s;
};

const getStatusIcon = (status: string) => {
  const s = normalizeStatus(status);

  if (s === 'published') return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (s === 'draft') return <Clock className="h-4 w-4 text-yellow-500" />;
  if (s === 'pending') return <Clock className="h-4 w-4 text-orange-500" />;
  if (s === 'rejected') return <XCircle className="h-4 w-4 text-red-500" />;
  if (s === 'archived') return <XCircle className="h-4 w-4 text-gray-500" />;
  if (s === 'approved') return <CheckCircle className="h-4 w-4 text-emerald-600" />;
  if (s === 'winner') return <Trophy className="h-4 w-4 text-amber-500" />;
  if (s === 'disqualified') return <XCircle className="h-4 w-4 text-purple-600" />;

  return <Clock className="h-4 w-4 text-gray-500" />;
};

const getStatusBadge = (status: string) => {
  const s = normalizeStatus(status);

  if (s === 'published') return 'bg-green-100 text-green-800';
  if (s === 'draft') return 'bg-yellow-100 text-yellow-800';
  if (s === 'pending') return 'bg-orange-100 text-orange-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  if (s === 'archived') return 'bg-gray-100 text-gray-800';
  if (s === 'approved') return 'bg-emerald-100 text-emerald-800';
  if (s === 'winner') return 'bg-amber-100 text-amber-800 font-semibold';
  if (s === 'disqualified') return 'bg-purple-100 text-purple-800';

  return 'bg-gray-100 text-gray-800';
};

// ────────────────────────────────────────────────

interface UnifiedSubmission {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  file_url?: string | null;
  status: string;
  views_count: number;
  created_at: string;

  contestEntryId?: string;
  contestTitle?: string;
  contestEntryStatus?: string;
  rank?: number | null;

  isContestSubmission: boolean;
}

// ────────────────────────────────────────────────

export default function ManageSubmissionsPage() {
  // ── Hooks (ALWAYS at top, no conditions) ─────────
  const [activeTab, setActiveTab] = useState('all');

  const { user, loading: authLoading } = useAuth();

  const { data: artworksData, isLoading: artworksLoading } = useGetMyArtworksQuery(
    activeTab === 'all' || activeTab === 'in-contests' ? undefined : { status: activeTab }
  );

  const { data: entriesResponse, isLoading: entriesLoading } = useGetMyContestEntriesQuery();

  const [deleteArtwork, { isLoading: isDeletingArtwork }] = useDeleteArtworkMutation();

  const artworks = artworksData?.artworks ?? [];
  const contestEntries = entriesResponse?.entries ?? [];

  // ✅ hook MUST be before any return
  const entryMap = useMemo(
    () => new Map(contestEntries.map((e) => [e.artwork_id, e])),
    [contestEntries]
  );

  const isLoading = authLoading || artworksLoading || entriesLoading;

  // ── Early returns AFTER hooks ───────────────────
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[60vh]">
        <Skeleton className="h-10 w-40" />
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

  // ── Derived data ────────────────────────────────
  const username = user.username?.toLowerCase() || 'anonymous';
  const artistBase = `/artist/${username}`;

  const unified: UnifiedSubmission[] = [];

  artworks.forEach((art: ArtworkListItem) => {
    const entry = entryMap.get(art.id);

    unified.push({
      id: art.id,
      title: art.title,
      description: art.description,
      thumbnail_url: art.thumbnail_url,
      file_url: art.file_url,
      status: normalizeStatus(art.status),
      views_count: art.views_count,
      created_at: art.created_at,
      isContestSubmission: !!entry,
      ...(entry && {
        contestEntryId: entry.entry_id,
        contestTitle: entry.contest_title,
        contestEntryStatus: entry.entry_status,
        rank: entry.rank,
      }),
    });
  });

  let displayed = unified;

  if (activeTab === 'in-contests') {
    displayed = unified.filter((i) => i.isContestSubmission);
  } else if (activeTab !== 'all') {
    displayed = unified.filter((i) => normalizeStatus(i.status) === activeTab);
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteArtwork(id).unwrap();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // ── UI ─────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Submissions</h1>

        <Link href={`${artistBase}/my-artworks/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Artwork
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <div className="text-center py-10 text-muted-foreground">No submissions found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {displayed.map((item) => (
                <Card key={item.id}>
                  <div className="relative aspect-square">
                    <Image
                      src={item.thumbnail_url || item.file_url || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardContent>
                    <h3 className="font-medium">{item.title}</h3>

                    <Badge className={getStatusBadge(item.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </span>
                    </Badge>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Link href={`/artworks/${item.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeletingArtwork}
                    >
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
