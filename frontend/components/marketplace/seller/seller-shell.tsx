'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Store, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/marketplace/status-badge';
import { useAuth } from '@/store/AuthContext';
import {
  getApiErrorMessage,
  useApplyAsSellerMutation,
  useGetMySellerProfileQuery,
} from '@/services/api/marketplaceApi';
import { SELLER_STATUS } from '@/lib/marketplace/format';
import { isBrandRole } from '@/lib/marketplace/roles';
import { cn } from '@/lib/utils';

export interface SellerContext {
  /** Dashboard root, e.g. /artist/jane or /brand-manager/acme */
  basePath: string;
  /** Set for brand accounts: products are listed under this brand. */
  brandId: string | null;
}

export function useSellerContext(basePath: string): SellerContext {
  const { user } = useAuth();

  // A brand manager can run several brands, so resolve the one whose slug is
  // in the dashboard URL (/brand-manager/<slug>) instead of assuming the
  // first. Falls back to the first brand only when the slug isn't matched.
  const slug = /^\/brand-manager\/([^/]+)/.exec(basePath)?.[1];
  const brands = user?.brands ?? [];
  const brandId = isBrandRole(user?.role?.name)
    ? ((slug ? brands.find((b) => b.slug === slug) : undefined)?.id ?? brands[0]?.id ?? null)
    : null;

  return { basePath, brandId };
}

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Products', path: '/products' },
  { label: 'Orders', path: '/orders' },
  { label: 'Payouts', path: '/payouts' },
];

// Wraps every seller page: tab bar + the seller-eligibility gate.
//  - Brand accounts sell as the brand (the backend checks brand access).
//  - Individual creators need an approved seller_profile first.
export function SellerShell({
  basePath,
  title,
  actions,
  children,
}: {
  basePath: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const storeBase = `${basePath}/store`;
  const brandSeller = isBrandRole(user?.role?.name);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Store className="h-6 w-6" /> {title}
        </h1>
        {actions}
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b" aria-label="Store sections">
        {TABS.map((t) => {
          const href = `${storeBase}${t.path}`;
          const active = t.path === '' ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={t.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {brandSeller ? children : <ProfileGate>{children}</ProfileGate>}
    </div>
  );
}

function ProfileGate({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading } = useGetMySellerProfileQuery();
  const [apply, { isLoading: applying }] = useApplyAsSellerMutation();
  const [name, setName] = useState('');

  if (isLoading) return <p className="text-muted-foreground">Loading your seller profile…</p>;

  if (profile?.status === 'approved') return <>{children}</>;

  if (profile) {
    const rejected = profile.status === 'rejected' || profile.status === 'suspended';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {rejected ? <XCircle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-amber-500" />}
            Seller application
            <StatusBadge map={SELLER_STATUS} status={profile.status} />
          </CardTitle>
          <CardDescription>
            {rejected
              ? 'Your seller access is not active.'
              : "We're reviewing your application — you'll be able to list merch as soon as it's approved."}
          </CardDescription>
        </CardHeader>
        {profile.notes && (
          <CardContent>
            <p className="rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">Note from the team: </span>
              {profile.notes}
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Start selling merch</CardTitle>
        <CardDescription>
          Choose a public seller name. Our team reviews every new seller before listings go live.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await apply({ display_name: name.trim() }).unwrap();
              toast({ title: 'Application submitted' });
            } catch (err) {
              toast({
                title: "Couldn't submit",
                description: getApiErrorMessage(err),
                variant: 'destructive',
              });
            }
          }}
        >
          <div>
            <Label htmlFor="seller-name">Seller name</Label>
            <Input
              id="seller-name"
              className="mt-1"
              required
              placeholder={user?.username ?? 'Your studio name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={applying || !name.trim()}>
            {applying ? 'Submitting…' : 'Apply to sell'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
