'use client';

// /brand-manager landing page.
//
// BRD-02 / BRD-03 / BRD-04 / BRD-09: brand accounts without a linked brand
// (verification still pending) were sent to /brand-manager, which did not
// exist (404), and the "Start Brand Verification" link pointed at
// /brand/verify, which the public /brand/[slug] route swallowed ("Brand Not
// Found"). This page is the single entry point: it forwards to the brand
// dashboard when a brand exists, and otherwise explains the account status.

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BrandManagerHome() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const brand = user?.brands?.[0];

  useEffect(() => {
    if (!loading && brand?.slug) {
      router.replace(`/brand-manager/${brand.slug}`);
    }
  }, [loading, brand?.slug, router]);

  if (loading || brand?.slug) {
    return <div className="flex h-full items-center justify-center p-12">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6 lg:p-12">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>
          <CardTitle>Brand verification pending</CardTitle>
          <CardDescription>
            Your account ({user?.email}) is not linked to a verified brand yet. Our team reviews
            every brand before it can run opportunities or manage licensing. This usually takes
            1–2 business days, and we&apos;ll email you once it&apos;s done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-muted-foreground">
              Haven&apos;t submitted your brand details yet, or need to update them? Send a
              verification request and include your company name, website and a contact email
              on your company domain.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/contact/sales">Submit / update verification</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">Account settings</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/explore">Explore the platform</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
