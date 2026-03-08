'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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
import { useAuth } from '@/store/AuthContext';

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
  const { user } = useAuth();

  let brandId: string | undefined;
  let brandSlug: string | undefined;
  let brandBase = '';

  if (user?.role?.name === 'brand_manager') {
    const managedBrand = user?.brands?.[0];

    if (managedBrand) {
      brandId = managedBrand.id;
      brandSlug = managedBrand.slug;

      if (brandSlug && user?.id) {
        brandBase = `/dashboard/brand/${brandSlug}/${user.id}`;
      }
    }
  }

  if (!brandSlug) {
    brandSlug = params['brand-slug'] as string | undefined;
  }

  const {
    data: contestsResponse,
    isLoading,
    isError,
    error,
  } = useGetContestsQuery(brandId ? { brandId } : undefined, { skip: !brandId });

  const contests = contestsResponse?.contests ?? [];

  const activeContests = contests.filter((c: any) =>
    ['live', 'published'].includes(c.status?.toLowerCase() ?? '')
  );

  const closedContests = contests.filter((c: any) =>
    ['completed', 'archived'].includes(c.status?.toLowerCase() ?? '')
  );

  const draftContests = contests.filter((c: any) => (c.status?.toLowerCase() ?? '') === 'draft');

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">Loading opportunities...</p>
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
            {(error as any)?.data?.message || 'An unexpected error occurred. Please try again.'}
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
            <h1 className="text-3xl font-bold tracking-tight">Opportunities Management</h1>
            <p className="text-lg text-muted-foreground">
              Create and manage fan art contests and licensing opportunities.
            </p>
          </div>

          {brandBase ? (
            <Link href={`${brandBase}/contests/create`}>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Opportunity
              </Button>
            </Link>
          ) : (
            <Button size="lg" disabled>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {contests.length === 0 ? (
              <EmptyState brandBase={brandBase} />
            ) : (
              <OpportunityGrid items={contests} brandBase={brandBase} />
            )}
          </TabsContent>

          <TabsContent value="active">
            {activeContests.length === 0 ? (
              <EmptyState label="active" brandBase={brandBase} />
            ) : (
              <OpportunityGrid items={activeContests} brandBase={brandBase} />
            )}
          </TabsContent>

          <TabsContent value="closed">
            {closedContests.length === 0 ? (
              <EmptyState label="closed" brandBase={brandBase} />
            ) : (
              <OpportunityGrid items={closedContests} brandBase={brandBase} isClosed />
            )}
          </TabsContent>

          <TabsContent value="draft">
            {draftContests.length === 0 ? (
              <EmptyState label="draft" brandBase={brandBase} isCreateButton />
            ) : (
              <OpportunityGrid items={draftContests} brandBase={brandBase} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}

function OpportunityGrid({
  items,
  brandBase,
  isClosed = false,
}: {
  items: any[];
  brandBase: string;
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
                src={opp.hero_image || '/placeholder.svg'}
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
                    <Button variant="ghost" size="icon" className="bg-black/20 text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
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

            <CardHeader>
              <CardTitle className="line-clamp-1 text-xl">{opp.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                {opp.description || 'No description provided.'}
              </p>

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
                  <span className="text-muted-foreground">{opp.entry_count ?? 0} Entries</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="grid grid-cols-2 gap-4 border-t bg-muted/50 p-4">
              <Link href={`${brandBase}/contests/${opp.id}`} className="w-full">
                <Button variant="secondary" className="w-full">
                  {isClosed ? 'View Results' : 'Manage'}
                </Button>
              </Link>

              {isClosed ? (
                <Link href={`${brandBase}/contests/${opp.id}/reopen`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Reopen
                  </Button>
                </Link>
              ) : (
                <Link href={`/opportunities/${opp.slug || opp.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Public Page
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

function EmptyState({
  label = '',
  brandBase = '',
  isCreateButton = false,
}: {
  label?: string;
  brandBase?: string;
  isCreateButton?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h3 className="mb-2 text-lg font-medium">No {label ? `${label} ` : ''}Opportunities</h3>

      <p className="mb-4 text-sm text-muted-foreground">
        {label
          ? `You don't have any ${label} opportunities yet.`
          : "You haven't created any opportunities yet."}
      </p>

      {isCreateButton && brandBase && (
        <Link href={`${brandBase}/contests/create`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Opportunity
          </Button>
        </Link>
      )}
    </div>
  );
}
