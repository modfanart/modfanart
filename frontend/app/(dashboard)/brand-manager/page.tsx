'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, MailWarning, CheckCircle2, XCircle } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { userApi } from '@/services/api/userApi';
import { useGetMyVerificationRequestQuery } from '@/services/api/brands';
import { BrandVerificationForm } from '@/components/brands/brand-verification-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/**
 * /brand-manager — the "Dashboard" link for brand accounts (AUTH-01).
 *
 * A brand account's dashboard lives at /brand-manager/<slug>, but an account has no brand
 * until platform staff approve its verification request. This page used to 404. Now it
 * forwards to the brand dashboard once there is one, and until then shows where the
 * application stands, or the form to file one.
 */
export default function BrandManagerHomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAuth();
  const brandSlug = user?.brands?.[0]?.slug;

  const {
    data,
    isLoading: requestLoading,
    isError,
    refetch,
  } = useGetMyVerificationRequestQuery(undefined, { skip: !user || Boolean(brandSlug) });

  useEffect(() => {
    if (brandSlug) router.replace(`/brand-manager/${brandSlug}`);
  }, [brandSlug, router]);

  const refreshBrands = () => {
    dispatch(userApi.util.invalidateTags(['CurrentUser']));
    refetch();
  };

  if (loading || !user || brandSlug || (requestLoading && !data)) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-muted-foreground" role="status">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        Loading your brand…
      </div>
    );
  }

  const request = data?.request ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Set up your brand</h1>
        <p className="mt-1 text-muted-foreground">
          Your brand dashboard opens once our team has verified your brand.
        </p>
      </div>

      {isError && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <p className="text-sm">We couldn&apos;t load your verification status.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isError && !user.email_verified && (
        <Card>
          <CardHeader>
            <MailWarning className="h-8 w-8 text-amber-600" aria-hidden="true" />
            <CardTitle>Confirm your email first</CardTitle>
            <CardDescription>
              Brand verification requests are accepted from confirmed email addresses only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-black hover:bg-gray-900">
              <Link href="/verify-account?next=%2Fbrand-manager">Verify my email</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isError && user.email_verified && request &&
        (request.status === 'pending' || request.status === 'interview_scheduled') && (
          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-violet-600" aria-hidden="true" />
              <CardTitle>Your application is under review</CardTitle>
              <CardDescription>
                We received the verification request for{' '}
                <span className="font-medium text-foreground">{request.company_name}</span> on{' '}
                {formatDate(request.created_at)}.{' '}
                {request.status === 'interview_scheduled'
                  ? 'We will be in touch to schedule a call.'
                  : 'We usually reply within 1–3 business days, by email to ' + request.contact_email + '.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={refreshBrands}>
                Check status
              </Button>
              <Button asChild variant="ghost">
                <Link href="/contact">Contact support</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      {!isError && user.email_verified && request?.status === 'approved' && (
        <Card>
          <CardHeader>
            <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            <CardTitle>Your brand is approved</CardTitle>
            <CardDescription>
              {request.company_name} was approved on {formatDate(request.reviewed_at)}. Open
              your dashboard to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshBrands} className="bg-black hover:bg-gray-900">
              Open brand dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {!isError && user.email_verified && (!request || request.status === 'rejected') && (
        <Card>
          <CardHeader>
            {request?.status === 'rejected' && (
              <XCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
            )}
            <CardTitle>
              {request?.status === 'rejected'
                ? 'Your previous application was not approved'
                : 'Request brand verification'}
            </CardTitle>
            <CardDescription>
              {request?.status === 'rejected'
                ? 'You can update your details and apply again, or contact support to find out more.'
                : 'Tell us about your brand. Once verified, you can launch opportunities and license fan art.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrandVerificationForm
              defaultCompanyName={request?.company_name ?? ''}
              defaultContactEmail={user.email}
              onSubmitted={() => refetch()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
