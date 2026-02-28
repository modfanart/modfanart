'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation'; // ← add this
import { CalendarIcon, Users, PlusCircle, Edit, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardShell } from '@/components/dashboard-shell';
import { useGetContestsQuery } from '@/services/api/contestsApi';
import { CheckCircle, XCircle, Clock, Trophy } from 'lucide-react';
// ... keep getStatusBadge unchanged ...
const getStatusBadge = (status: string = 'unknown') => {
  const s = status.toLowerCase();

  switch (s) {
    case 'published':
    case 'live':
      return {
        label: 'Live',
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-600',
      };

    case 'draft':
      return {
        label: 'Draft',
        variant: 'secondary' as const,
        className: 'bg-yellow-500/20 text-yellow-700',
      };

    case 'pending':
    case 'judging':
      return {
        label: 'In Review',
        variant: 'outline' as const,
        className: 'border-orange-500 text-orange-700',
      };

    case 'completed':
      return {
        label: 'Completed',
        variant: 'secondary' as const,
        className: 'bg-gray-600 hover:bg-gray-600',
      };

    case 'archived':
      return {
        label: 'Archived',
        variant: 'outline' as const,
        className: 'border-gray-400 text-gray-500',
      };

    case 'rejected':
      return {
        label: 'Rejected',
        variant: 'destructive' as const,
        className: '',
      };

    case 'approved':
      return {
        label: 'Approved',
        variant: 'default' as const,
        className: 'bg-emerald-600 hover:bg-emerald-600',
      };

    case 'winner':
    case 'winners announced':
      return {
        label: 'Winners Announced',
        variant: 'default' as const,
        className: 'bg-amber-500 hover:bg-amber-500',
      };

    default:
      return {
        label: 'Unknown',
        variant: 'secondary' as const,
        className: 'bg-gray-400/30',
      };
  }
};
export default function OpportunitiesManagementPage() {
  const params = useParams();

  // Option A: if route is /dashboard/brands/[brandId]/opportunities
  const brandId = params['brandId'] as string | undefined;

  // Option B: if route is /dashboard/opportunities/[brandSlug]
  // const brandSlug = params.brandSlug as string | undefined;

  // Option C: if you pass brand manager id or something else
  // const brandManagerId = params.brandManagerId as string | undefined;

  // Choose one depending on your route structure
  // Here we assume brandId is in the dynamic segment
  const {
    data: contestsResponse,
    isLoading,
    isError,
    error,
  } = useGetContestsQuery(brandId ? { brandId } : undefined, {
    // Optional: skip query if no brandId
    skip: !brandId,
  });

  const contests = contestsResponse?.contests ?? [];

  const activeContests = contests.filter((c) => c.status === 'live' || c.status === 'published');
  const closedContests = contests.filter(
    (c) => c.status === 'completed' || c.status === 'archived'
  );
  const draftContests = contests.filter((c) => c.status === 'draft');

  // Optional: show brand name in header if you fetch it or pass it
  // const brandName = contests[0]?.brand_name || 'Your Brand';

  if (!brandId) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-destructive p-6 text-center">
          <p className="text-destructive">No brand selected</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please access this page from a specific brand dashboard.
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">Loading brand opportunities...</p>
        </div>
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell>
        <div className="rounded-lg border border-destructive p-6 text-center">
          <p className="text-destructive">Failed to load opportunities</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as any)?.data?.message || 'Please try again later.'}
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {/* {brandName ? `${brandName} ` : ''} */}Opportunities Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Create and manage fan art contests and licensing opportunities for this brand.
            </p>
          </div>
          <Link href={`/dashboard/brands/${brandId}/opportunities/create`}>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger value="all" className="...">
              All Opportunities
            </TabsTrigger>
            <TabsTrigger value="active" className="...">
              Active
            </TabsTrigger>
            <TabsTrigger value="closed" className="...">
              Closed
            </TabsTrigger>
            <TabsTrigger value="draft" className="...">
              Drafts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {contests.length === 0 ? <EmptyState /> : <OpportunityGrid items={contests} />}
          </TabsContent>

          <TabsContent value="active" className="space-y-8">
            {activeContests.length === 0 ? (
              <EmptyState label="active" />
            ) : (
              <OpportunityGrid items={activeContests} />
            )}
          </TabsContent>

          <TabsContent value="closed" className="space-y-8">
            {closedContests.length === 0 ? (
              <EmptyState label="closed" />
            ) : (
              <OpportunityGrid items={closedContests} isClosed />
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-8">
            {draftContests.length === 0 ? (
              <EmptyState label="draft" isCreateButton />
            ) : (
              <OpportunityGrid items={draftContests} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

// Keep OpportunityGrid and EmptyState the same
// (just remember to adjust create & view links to include brandId if needed)
// ── Reusable grid renderer ───────────────────────────────────────
function OpportunityGrid({
  items,
  isClosed = false,
}: {
  items: any[]; // Contest[]
  isClosed?: boolean;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((opp) => {
        const statusInfo = getStatusBadge(opp.status);
        const deadline = opp.submission_end_date || opp.end_date || opp.deadline;

        return (
          <Card key={opp.id} className="flex flex-col overflow-hidden">
            <div className="relative h-48">
              <Image
                src={opp.hero_image || '/placeholder.svg?height=300&text=No+Image'}
                alt={opp.title}
                fill
                className="object-cover"
              />
              <div className="absolute right-2 top-2">
                <Badge variant={statusInfo.variant} className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="absolute right-2 bottom-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/20 text-white hover:bg-black/30"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CardHeader className="flex-1">
              <CardTitle className="line-clamp-1 text-xl">{opp.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="line-clamp-2 text-sm text-muted-foreground mb-4">{opp.description}</p>

              {opp.categories && opp.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {opp.categories.map((cat: string) => (
                    <Badge key={cat} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isClosed ? 'Ended ' : 'Due '}
                    {deadline ? new Date(deadline).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {opp.entry_count != null ? `${opp.entry_count} Entries` : '—'}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-4 border-t bg-muted/50 p-4">
              <Link href={`/dashboard/opportunities/${opp.id}`} className="w-full">
                <Button variant="secondary" className="w-full">
                  {isClosed ? 'View Results' : 'Manage'}
                </Button>
              </Link>

              {isClosed ? (
                <Link href={`/dashboard/opportunities/${opp.id}/reopen`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Reopen
                  </Button>
                </Link>
              ) : (
                <Link href={`/opportunities/${opp.slug || opp.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Public
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// ── Reusable empty states ────────────────────────────────────────
function EmptyState({
  label = '',
  isCreateButton = false,
}: {
  label?: string;
  isCreateButton?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="mb-2 text-lg font-medium">No {label ? label + ' ' : ''}Opportunities</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {label
          ? `You don't have any ${label.toLowerCase()} opportunities yet.`
          : "You haven't created any opportunities yet."}
      </p>

      {isCreateButton && (
        <Link href="/dashboard/opportunities/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Opportunity
          </Button>
        </Link>
      )}
    </div>
  );
}
