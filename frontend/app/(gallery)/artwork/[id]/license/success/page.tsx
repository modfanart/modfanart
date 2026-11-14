'use client';

// Post-payment confirmation for a direct license purchase.
//
// Replaces two broken pieces: the checkout redirected to /license/success
// (no such route, buyers landed on a 404), and the old
// /artwork/[id]/license/[licenseId]/success page showed hard-coded fake data
// ("LIC-20240306-1234", "March 6, 2024") to every visitor. This page shows
// the buyer's real license once the Stripe webhook has issued it.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequireAuth } from '@/components/marketplace/require-auth';
import { useGetMyLicensesQuery } from '@/services/api/licenseApi';

function Content() {
  const { id: artworkId } = useParams<{ id: string }>();
  const [stop, setStop] = useState(false);
  const { data: licenses, isLoading } = useGetMyLicensesQuery(undefined, {
    pollingInterval: stop ? 0 : 4000,
  });

  // Newest active license for this artwork.
  const license = (licenses ?? [])
    .filter((l) => l.artwork_id === artworkId && l.is_active)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];

  useEffect(() => {
    if (license) setStop(true);
  }, [license]);
  useEffect(() => {
    const t = setTimeout(() => setStop(true), 120_000);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) {
    return <p className="py-20 text-center text-muted-foreground">Loading your license…</p>;
  }

  if (!license) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Clock className="mx-auto mb-4 h-14 w-14 text-warning-strong" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-bold">Payment received — issuing your license</h1>
        <p className="mb-8 text-muted-foreground">
          {stop
            ? "This is taking longer than usual. Your license will appear under Licensing as soon as it's issued, and we'll email you."
            : 'This usually takes a few seconds. This page updates automatically.'}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/licensing">Go to my licenses</Link>
        </Button>
      </div>
    );
  }

  const issued = new Date(license.created_at).toLocaleDateString('en-US', { dateStyle: 'long' });
  const hasPdf = license.contract_pdf_url && /^https?:\/\//.test(license.contract_pdf_url);

  return (
    <div className="container max-w-3xl py-16">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
          <CheckCircle className="h-8 w-8 text-success" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">License purchased</h1>
        <p className="text-muted-foreground">Your license is active. A copy has been emailed to you.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>License details</CardTitle>
          <CardDescription>Keep these for your records.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">License ID</dt>
              <dd className="font-mono text-sm">{license.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Issued</dt>
              <dd className="font-medium">{issued}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">License type</dt>
              <dd className="font-medium capitalize">{license.license_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Expires</dt>
              <dd className="font-medium">
                {license.expires_at
                  ? new Date(license.expires_at).toLocaleDateString('en-US', { dateStyle: 'long' })
                  : 'No expiry'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {hasPdf && (
          <Button asChild>
            <a href={license.contract_pdf_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Download license agreement
            </a>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard/licensing">View all my licenses</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/gallery">Browse more artwork</Link>
        </Button>
      </div>
    </div>
  );
}

export default function LicenseSuccessPage() {
  return (
    <RequireAuth message="Sign in to see your license.">
      <Content />
    </RequireAuth>
  );
}
