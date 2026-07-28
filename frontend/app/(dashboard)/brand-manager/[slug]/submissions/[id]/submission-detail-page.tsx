'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  ExternalLink,
  Rocket,
  Tag,
  Trash2,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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

import { useAuth } from '@/store/AuthContext';
import {
  useGetArtworkQuery,
  useGetArtworkCategoriesQuery,
  useDeleteArtworkMutation,
  usePublishArtworkMutation,
} from '@/services/api/artworkApi';
import { useGetArtworkTagsQuery } from '@/services/api/artworkTagsApi';
import { useGetIssuedLicensesQuery, useRevokeLicenseMutation } from '@/services/api/licenseApi';
import { useGetMyContestEntriesQuery } from '@/services/api/contestsApi';

// ────────────────────────────────────────────────
// Status display
// ────────────────────────────────────────────────

type ArtworkStatus = 'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected';

const STATUS_STYLES: Record<ArtworkStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800' },
  published: { label: 'Published', className: 'bg-green-100 text-green-800' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800' },
  moderation_pending: { label: 'Pending Review', className: 'bg-orange-100 text-orange-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

const formatCents = (cents: number, currency: 'INR' | 'USD') =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);

interface Props {
  id: string;
  slug: string;
}

function SubmissionDetailPageContent({ id, slug }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [revokeLicenseId, setRevokeLicenseId] = useState<string | null>(null);

  const backHref = `/brand-manager/${slug}/submissions`;

  const {
    data: artwork,
    isLoading: artworkLoading,
    isError,
    error,
    refetch,
  } = useGetArtworkQuery(id, { skip: !id });

  const { data: tags = [], isLoading: tagsLoading } = useGetArtworkTagsQuery(id, { skip: !id });

  const { data: categories = [], isLoading: categoriesLoading } = useGetArtworkCategoriesQuery(
    id,
    { skip: !id }
  );

  const { data: issuedLicenses = [], isLoading: licensesLoading } = useGetIssuedLicensesQuery();

  const { data: entriesResponse, isLoading: entriesLoading } = useGetMyContestEntriesQuery();

  const [deleteArtwork, { isLoading: isDeleting }] = useDeleteArtworkMutation();
  const [publishArtwork, { isLoading: isPublishing }] = usePublishArtworkMutation();
  const [revokeLicense, { isLoading: isRevoking }] = useRevokeLicenseMutation();

  const artworkLicenses = issuedLicenses.filter((l) => l.artwork_id === id);
  const contestEntry = entriesResponse?.entries?.find((e: any) => e.artwork_id === id);

  const isLoading =
    authLoading || artworkLoading || tagsLoading || categoriesLoading || licensesLoading || entriesLoading;

  const isOwner = !!user && !!artwork && artwork.creator_id === user.id;

  // ────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────

  const handleDelete = async () => {
    try {
      await deleteArtwork(id).unwrap();
      router.push(backHref);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteOpen(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishArtwork(id).unwrap();
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  const handleRevoke = async () => {
    if (!revokeLicenseId) return;
    try {
      await revokeLicense({ id: revokeLicenseId }).unwrap();
      setRevokeLicenseId(null);
    } catch (err) {
      console.error('Revoke failed:', err);
    }
  };

  // ────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <Skeleton className="h-4 w-20" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="aspect-square relative rounded-md overflow-hidden">
                  <Skeleton className="h-full w-full absolute" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Error / not-found state
  // ────────────────────────────────────────────────

  if (isError || !artwork) {
    const notFound = (error as { status?: number })?.status === 404;

    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">
            {notFound
              ? "This submission doesn't exist or may have been removed."
              : 'Something went wrong loading this submission. Please try again.'}
          </p>
          <div className="flex gap-2">
            <Link href={backHref}>
              <Button variant="outline">Back to Submissions</Button>
            </Link>
            {!notFound && <Button onClick={() => refetch()}>Try Again</Button>}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Not the owner
  // ────────────────────────────────────────────────

  if (!isOwner) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">
            You don't have permission to manage this submission.
          </p>
          <Link href={backHref}>
            <Button variant="outline">Back to Submissions</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Loaded state
  // ────────────────────────────────────────────────

  const statusInfo = STATUS_STYLES[artwork.status] ?? STATUS_STYLES.draft;
  const activePricingTiers = (artwork.pricing_tiers ?? []).filter((t) => t.is_active);
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  const isWinner = contestEntry?.rank === 1;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Submissions
          </Button>
        </Link>
        <Badge className={`${statusInfo.className} hover:${statusInfo.className}`}>
          {statusInfo.label}
        </Badge>
        {artwork.moderation_status && artwork.moderation_status !== artwork.status && (
          <Badge variant="outline">{artwork.moderation_status}</Badge>
        )}
        {isWinner && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Contest Winner
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{artwork.title}</CardTitle>
              {artwork.description && <CardDescription>{artwork.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative rounded-md overflow-hidden">
                <Image
                  src={artwork.file_url || artwork.thumbnail_url || '/placeholder.svg'}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {artwork.views_count} views
                </span>
                <span className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {artwork.favorites_count} favorites
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {artwork.status === 'published' && (
                  <Link href={`/artwork/${artwork.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Public Page
                    </Button>
                  </Link>
                )}
                {artwork.status === 'draft' && (
                  <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                    <Rocket className="h-4 w-4 mr-1" />
                    {isPublishing ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this artwork?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The artwork and its listing will be
                        permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              {activePricingTiers.length > 0 && (
                <TabsTrigger value="pricing">Licensing</TabsTrigger>
              )}
              {contestEntry && <TabsTrigger value="contest">Contest</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Submitted</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(artwork.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Last Updated</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {new Date(artwork.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {sortedCategories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {sortedCategories.map((cat) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {artwork.moderation_notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Moderation Notes</h4>
                        <div className="bg-muted p-3 rounded-md text-sm">
                          {artwork.moderation_notes}
                        </div>
                        {artwork.moderated_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Reviewed on {new Date(artwork.moderated_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {activePricingTiers.length > 0 && (
              <TabsContent value="pricing" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Licensing & Pricing</CardTitle>
                    <CardDescription>License tiers available on your public listing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activePricingTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="border rounded-md p-4 flex justify-between items-center"
                      >
                        <p className="font-medium capitalize">{tier.license_type}</p>
                        <div className="text-right text-sm">
                          <p className="font-medium">{formatCents(tier.price_usd_cents, 'USD')}</p>
                          <p className="text-muted-foreground">
                            {formatCents(tier.price_inr_cents, 'INR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {artworkLicenses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Issued Licenses</CardTitle>
                      <CardDescription>Buyers who currently hold a license for this piece</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {artworkLicenses.map((license) => (
                        <div
                          key={license.id}
                          className="border rounded-md p-4 flex justify-between items-center flex-wrap gap-2"
                        >
                          <div>
                            <p className="font-medium">
                              {license.buyer?.username ?? 'Unknown buyer'}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {license.license_type} •{' '}
                              {license.is_active ? 'Active' : 'Revoked'} •{' '}
                              Issued {new Date(license.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <a href={license.contract_pdf_url} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm">
                                View Contract
                              </Button>
                            </a>
                            {license.is_active && (
                              <AlertDialog
                                open={revokeLicenseId === license.id}
                                onOpenChange={(open) => !open && setRevokeLicenseId(null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setRevokeLicenseId(license.id)}
                                  >
                                    Revoke
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Revoke this license?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      The buyer will lose their usage rights to this artwork.
                                      This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={isRevoking}
                                      onClick={handleRevoke}
                                    >
                                      {isRevoking ? 'Revoking...' : 'Revoke'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {contestEntry && (
              <TabsContent value="contest" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contest Entry</CardTitle>
                    {contestEntry.contest_title && (
                      <CardDescription>{contestEntry.contest_title}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {contestEntry.status && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry Status</span>
                        <span className="font-medium capitalize">{contestEntry.status}</span>
                      </div>
                    )}
                    {contestEntry.rank != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rank</span>
                        <span className="font-medium">#{contestEntry.rank}</span>
                      </div>
                    )}
                    {contestEntry.judge_score != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Judge Score</span>
                        <span className="font-medium">{contestEntry.judge_score}</span>
                      </div>
                    )}
                    {contestEntry.judge_comments && (
                      <>
                        <Separator className="my-2" />
                        <div>
                          <p className="text-muted-foreground mb-1">Judge Comments</p>
                          <p>{contestEntry.judge_comments}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Views</span>
                  <span className="font-medium">{artwork.views_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Favorites</span>
                  <span className="font-medium">{artwork.favorites_count}</span>
                </div>
                {artworkLicenses.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Licenses Issued</span>
                    <span className="font-medium">{artworkLicenses.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {artwork.status === 'moderation_pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your submission is currently under review. We'll notify you when there's an
                  update.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span>Average review time:</span>
                  <span className="font-medium">2-3 business days</span>
                </div>
              </CardContent>
            </Card>
          )}

          {artwork.status === 'rejected' && artwork.moderation_notes && (
            <Card className="bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-300 text-base">
                  Submission Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 dark:text-red-400">
                  See moderation notes above for details on why this was rejected.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetailPageContent;