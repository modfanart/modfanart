'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  CalendarIcon,
  Users,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Link as LinkIcon,
  Copy,
  Loader2,
} from 'lucide-react';

import { useGetContestsQuery } from '@/services/api/contestsApi';
import { useAuth } from '@/store/AuthContext';

/* ShadCN UI */
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/* ───────────────── STATUS ───────────────── */

const getStatusBadge = (status: string = 'unknown') => {
  const s = status.toLowerCase();

  switch (s) {
    case 'published':
    case 'live':
      return { label: 'Live', variant: 'default' as const, className: 'bg-green-600' };

    case 'draft':
      return {
        label: 'Draft',
        variant: 'secondary' as const,
        className: 'bg-yellow-500/20 text-yellow-700',
      };

    case 'completed':
      return { label: 'Completed', variant: 'secondary' as const, className: 'bg-gray-600' };

    case 'archived':
      return { label: 'Archived', variant: 'outline' as const, className: 'text-gray-500' };

    default:
      return { label: 'Unknown', variant: 'secondary' as const, className: '' };
  }
};

/* ───────────────── PAGE ───────────────── */

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
        brandBase = `/brand-manager/${brandId}`;
      }
    }
  }

  if (!brandSlug) {
    brandSlug = params['brand-slug'] as string | undefined;
  }

  const { data, isLoading, isError, error } = useGetContestsQuery(
    brandId ? { brandId } : undefined,
    { skip: !brandId }
  );

  const contests = data?.contests ?? [];

  const activeContests = contests.filter((c: any) =>
    ['live', 'published'].includes(c.status?.toLowerCase() ?? '')
  );

  const closedContests = contests.filter((c: any) =>
    ['completed', 'archived'].includes(c.status?.toLowerCase() ?? '')
  );

  const draftContests = contests.filter((c: any) => c.status?.toLowerCase() === 'draft');

  if (isLoading) {
    return <p className="text-center py-12 text-muted-foreground">Loading...</p>;
  }

  if (isError) {
    return (
      <div className="border border-destructive rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load opportunities</p>
        <p className="text-sm text-muted-foreground mt-2">
          {(error as any)?.data?.message || 'Something went wrong.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Opportunities Management</h1>
          <p className="text-muted-foreground">
            Create and manage contests and licensing opportunities.
          </p>
        </div>

        {brandBase ? (
          <Link href={`${brandBase}/opportunities/create`}>
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Opportunity
            </Button>
          </Link>
        ) : (
          <Button size="lg" disabled>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Opportunity
          </Button>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OpportunityGrid items={contests} brandBase={brandBase} />
        </TabsContent>

        <TabsContent value="active">
          <OpportunityGrid items={activeContests} brandBase={brandBase} />
        </TabsContent>

        <TabsContent value="closed">
          <OpportunityGrid items={closedContests} brandBase={brandBase} isClosed />
        </TabsContent>

        <TabsContent value="draft">
          <OpportunityGrid items={draftContests} brandBase={brandBase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ───────────────── GRID + MODAL ───────────────── */

function OpportunityGrid({ items, brandBase, isClosed = false }: any) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  const generateLink = async (opp: any) => {
    setSelected(opp);
    setOpen(true);
    setLoading(true);
    setLink('');

    try {
      await new Promise((r) => setTimeout(r, 700));

      const token = Math.random().toString(36).substring(2, 10);

      setLink(`${window.location.origin}/judging/${opp.id}?token=${token}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (link) await navigator.clipboard.writeText(link);
  };

  return (
    <>
      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((opp: any) => {
          const status = getStatusBadge(opp.status);
          const deadline = opp.submission_end_date || opp.end_date || opp.deadline;

          return (
            <Card key={opp.id} className="overflow-hidden flex flex-col">
              {/* IMAGE */}
              <div className="relative h-48">
                <Image
                  src={opp.hero_image || '/placeholder.svg'}
                  alt={opp.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute top-2 right-2">
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </div>

                {/* MENU */}
                <div className="absolute bottom-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-black/40 text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href={`${brandBase}/opportunities/${opp.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href={`/opportunities/${opp.id}/monitor`}>
                          <Users className="mr-2 h-4 w-4" /> Monitor
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => generateLink(opp)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Generate Judging Link
                      </DropdownMenuItem>

                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* CONTENT */}
              <CardHeader>
                <CardTitle className="line-clamp-1">{opp.title}</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {opp.description || 'No description'}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {deadline ? new Date(deadline).toLocaleDateString() : '—'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {opp.entry_count ?? 0} Entries
                  </div>
                </div>
              </CardContent>

              {/* FOOTER */}
              <CardFooter className="grid grid-cols-2 gap-3 border-t p-4">
                <Link href={`${brandBase}/opportunities/${opp.id}/monitor`}>
                  <Button className="w-full">{isClosed ? 'Results' : 'Manage'}</Button>
                </Link>

                <Link
                  href={
                    isClosed
                      ? `${brandBase}/opportunities/${opp.id}/reopen`
                      : `/opportunities/${opp.slug || opp.id}`
                  }
                >
                  <Button variant="outline" className="w-full">
                    {isClosed ? 'Reopen' : 'View'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Judging Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected?.title}</p>

            <div className="p-3 border rounded-md text-sm break-all bg-muted/30">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              ) : (
                link || 'No link generated'
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={copy} disabled={!link} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>

              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
