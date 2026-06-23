'use client';

import Link from 'next/link';
import Image from 'next/image';
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
// Optional: helper to map backend status → UI-friendly label & variant
function getStatusBadge(status: string) {
  switch (status) {
    case 'live':
    case 'published':
      return {
        label: 'Active',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800',
      };
    case 'completed':
    case 'archived':
      return { label: 'Closed', variant: 'secondary' as const, className: '' };
    case 'draft':
      return { label: 'Draft', variant: 'outline' as const, className: '' };
    default:
      return { label: status, variant: 'secondary' as const, className: '' };
  }
}

export default function OpportunitiesManagementPage() {
  // You can pass status filter via query param if your backend supports it
  // Here we fetch all → then filter client-side (simple & works with small-medium datasets)
  const { data: contestsResponse, isLoading, isError, error } = useGetContestsQuery(); // or useGetContestsQuery({ status: undefined }) if needed

  const contests = contestsResponse?.contests ?? [];

  // Optional: group/filter once (you can also do it inside each TabsContent)
  const activeContests = contests.filter((c) => c.status === 'live' || c.status === 'published');
  const closedContests = contests.filter(
    (c) => c.status === 'completed' || c.status === 'archived'
  );
  const draftContests = contests.filter((c) => c.status === 'draft');

  // You may also want to derive "type": contest / rfd later from another field
  // For now we assume everything is contest (adjust if you have RFDs/licensing opps)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading your opportunities...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive p-6 text-center">
        <p className="text-destructive">Failed to load opportunities</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {(error as any)?.data?.message || 'Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Opportunities Management</h1>
          <p className="text-lg text-muted-foreground">
            Create and manage fan art contests and licensing opportunities.
          </p>
        </div>
        <Link href="/dashboard/opportunities/create">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <TabsList className="w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            All Opportunities
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Closed
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="relative h-11 rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Drafts
          </TabsTrigger>
        </TabsList>

        {/* ── ALL ──────────────────────────────────────────────── */}
        <TabsContent value="all" className="space-y-8">
          {contests.length === 0 ? <EmptyState /> : <OpportunityGrid items={contests} />}
        </TabsContent>

        {/* ── ACTIVE ───────────────────────────────────────────── */}
        <TabsContent value="active" className="space-y-8">
          {activeContests.length === 0 ? (
            <EmptyState label="active" />
          ) : (
            <OpportunityGrid items={activeContests} />
          )}
        </TabsContent>

        {/* ── CLOSED ───────────────────────────────────────────── */}
        <TabsContent value="closed" className="space-y-8">
          {closedContests.length === 0 ? (
            <EmptyState label="closed" />
          ) : (
            <OpportunityGrid items={closedContests} isClosed />
          )}
        </TabsContent>

        {/* ── DRAFTS ───────────────────────────────────────────── */}
        <TabsContent value="draft" className="space-y-8">
          {draftContests.length === 0 ? (
            <EmptyState label="draft" isCreateButton />
          ) : (
            <OpportunityGrid items={draftContests} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
