'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/store/AuthContext';
import { useGetMyArtworksQuery, useDeleteArtworkMutation } from '@/services/api/artworkApi';
import { useGetMyContestEntriesQuery, type UserContestEntry } from '@/services/api/contestsApi';

import type { ArtworkListItem } from '@/services/api/artworkApi';

interface UnifiedSubmission {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status: string;
  views_count: number;
  created_at: string;

  contestEntryId?: string;
  contestId?: string;
  contestTitle?: string;
  contestEntryStatus?: string;
  rank?: number | null;
  isContestSubmission: boolean;
}

const getStatusIcon = (status: string = 'unknown') => {
  const s = status.toLowerCase();
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

const getStatusBadge = (status: string = 'unknown') => {
  const s = status.toLowerCase();
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

export default function ManageSubmissionsPage() {
  const [activeTab, setActiveTab] = useState('all');

  // ── ALL HOOKS FIRST – unconditionally ───────────────────────────
  const { user, loading: authLoading } = useAuth();

  const {
    data: artworksData,
    isLoading: artworksLoading,
    isFetching: artworksFetching,
  } = useGetMyArtworksQuery(
    activeTab === 'all' || activeTab === 'in-contests' ? undefined : { status: activeTab }
  );

  const {
    data: entriesResponse,
    isLoading: entriesLoading,
    isFetching: entriesFetching,
  } = useGetMyContestEntriesQuery(undefined);

  const [deleteArtwork, { isLoading: isDeletingArtwork }] = useDeleteArtworkMutation();

  // ── Derived values ──────────────────────────────────────────────
  const artworks = artworksData?.artworks ?? [];
  const contestEntries = entriesResponse?.entries ?? [];

  const isLoadingOrFetching =
    authLoading || artworksLoading || entriesLoading || artworksFetching || entriesFetching;

  // ── Early returns AFTER all hooks ───────────────────────────────
  if (isLoadingOrFetching) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto animate-pulse" />
          <p className="text-muted-foreground">
            {authLoading ? 'Authenticating...' : 'Loading your submissions...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Please sign in</h2>
          <p className="text-muted-foreground">
            You need to be logged in to view and manage your submissions.
          </p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Safe to use user here ───────────────────────────────────────
  const username = user?.username?.trim().toLowerCase() ?? 'anonymous';
  const artistBase = `/artist/${username}`;

  const handleDeleteArtwork = async (id: string) => {
    try {
      await deleteArtwork(id).unwrap();
    } catch (err) {
      console.error('Failed to delete artwork:', err);
    }
  };

  // ── Build unified submissions ───────────────────────────────────
  const unifiedSubmissions: UnifiedSubmission[] = [];

  artworks.forEach((art: ArtworkListItem) => {
    const entry = contestEntries.find((e) => e.artwork_id === art.id);

    unifiedSubmissions.push({
      id: art.id,
      title: art.title || 'Untitled',
      description: art.description,
      thumbnail_url: art.thumbnail_url || art.file_url,
      status: art.status || 'unknown',
      views_count: art.views_count ?? 0,
      created_at: art.created_at,
      isContestSubmission: !!entry,
      ...(entry && {
        contestEntryId: entry.entry_id,
        contestId: entry.contest_id,
        contestTitle: entry.contest_title,
        contestEntryStatus: entry.entry_status,
        rank: entry.rank ?? null,
      }),
    });
  });

  contestEntries.forEach((entry: UserContestEntry) => {
    if (!unifiedSubmissions.some((u) => u.id === entry.artwork_id)) {
      unifiedSubmissions.push({
        id: entry.artwork_id,
        title: entry.artwork_title || 'Untitled',
        description: entry.artwork_description || null,
        thumbnail_url: entry.artwork_thumbnail_url || null,
        status: entry.artwork_status || 'unknown',
        views_count: entry.artwork_views_count ?? 0,
        created_at: entry.artwork_created_at || entry.submitted_at || new Date().toISOString(),
        contestEntryId: entry.entry_id,
        contestId: entry.contest_id,
        contestTitle: entry.contest_title,
        contestEntryStatus: entry.entry_status,
        rank: entry.rank ?? null,
        isContestSubmission: true,
      });
    }
  });

  let displayed = unifiedSubmissions;

  if (activeTab !== 'all' && activeTab !== 'in-contests') {
    displayed = unifiedSubmissions.filter((item) => item.status.toLowerCase() === activeTab);
  } else if (activeTab === 'in-contests') {
    displayed = unifiedSubmissions.filter((item) => item.isContestSubmission);
  }

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
        <Link href={`${artistBase}/my-artworks/new`}>
          <Button className="bg-[#9747ff] hover:bg-[#8035e0]">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Artwork
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="in-contests">In Contests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayed.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/40">
              <h3 className="text-lg font-medium">
                No {activeTab === 'all' ? 'submissions' : activeTab.replace(/-/g, ' ')} yet
              </h3>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'in-contests'
                  ? 'Submit your artwork to an active contest to see it here.'
                  : 'Start creating your first artwork!'}
              </p>
              <Link href={activeTab === 'in-contests' ? '/contests' : '/submissions/new'}>
                <Button className="mt-6 bg-[#9747ff] hover:bg-[#7e3dd1]">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {activeTab === 'in-contests' ? 'Browse Contests' : 'Create Artwork'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={
                        item.thumbnail_url || '/placeholder.svg?height=400&width=400&text=Artwork'
                      }
                      alt={item.title}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      <Badge className={getStatusBadge(item.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </Badge>

                      {item.isContestSubmission && item.contestEntryStatus && (
                        <Badge variant="outline" className="bg-white/90 text-xs">
                          {item.contestEntryStatus === 'winner'
                            ? 'Winner'
                            : item.contestEntryStatus}
                          {item.rank ? ` #${item.rank}` : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-1">{item.title}</h3>

                      {item.isContestSubmission && item.contestTitle && (
                        <p className="text-xs text-violet-600 font-medium">
                          Contest: {item.contestTitle}
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {item.description || 'No description provided'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>Views: {item.views_count.toLocaleString()}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Link href={`/artworks/${item.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/artworks/${item.id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>

                        {!item.contestEntryId && (
                          <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Artwork?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. The artwork and all associated
                                    data will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isDeletingArtwork}
                                    onClick={() => handleDeleteArtwork(item.id)}
                                  >
                                    {isDeletingArtwork ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
