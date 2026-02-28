// app/artwork/[id]/license/page.tsx
'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useGetArtworkQuery } from '@/services/api/artworkApi';
import {
  useCreateLicenseCheckoutSessionMutation,
  type CreateLicenseCheckoutSessionRequest,
  type LicenseCheckoutSessionResponse,
} from '@/services/api/licenseApi';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import type { Artwork, ArtworkPricingTier } from '@/services/api/artworkApi';

// Initialize Stripe (should be in a separate file in production)
import { config } from '@/lib/config';

const stripePromise = loadStripe(config.stripe.publicKey);
// ────────────────────────────────────────────────
// Zod Schema
// ────────────────────────────────────────────────

const formSchema = z.object({
  company: z.string().min(2, 'Company/organization name is required'),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  intendedUsage: z.string().min(20, 'Please describe your intended use in more detail'),
  distributionChannels: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the licensing terms and conditions',
  }),
});

type LicenseFormValues = z.infer<typeof formSchema>;

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const formatPrice = (cents: number, currency: 'USD' | 'INR' = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(cents / 100);
};

const capitalize = (s?: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const getDefaultTier = (tiers: ArtworkPricingTier[] = []): ArtworkPricingTier | undefined => {
  const active = tiers.filter((t) => t.is_active);
  return (
    active.find((t) => t.license_type === 'commercial') ||
    active.find((t) => t.license_type === 'personal') ||
    active[0]
  );
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

function LicenseFormContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const artworkId = params.id;
  const preselectedTierId = searchParams.get('tier');

  const {
    data: artwork,
    isLoading,
    isError,
    error,
  } = useGetArtworkQuery(artworkId, {
    skip: !artworkId,
  });

  const [createSession, { isLoading: isCreating }] = useCreateLicenseCheckoutSessionMutation();

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: '',
      website: '',
      intendedUsage: '',
      distributionChannels: '',
      agreeToTerms: false,
    },
  });

  // Auto-select tier from URL or default
  useEffect(() => {
    if (!artwork?.pricing_tiers?.length) return;

    const activeTiers = artwork.pricing_tiers.filter((t) => t.is_active);
    let tier = activeTiers.find((t) => t.id === preselectedTierId);

    if (!tier) {
      tier = getDefaultTier(activeTiers);
    }

    if (tier) {
      setSelectedTierId(tier.id);
    }
  }, [artwork, preselectedTierId]);

  const activeTiers = artwork?.pricing_tiers?.filter((t) => t.is_active) ?? [];
  const selectedTier = activeTiers.find((t) => t.id === selectedTierId) ?? activeTiers[0];

  const handleTierChange = (value: string) => {
    setSelectedTierId(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tier', value);
    window.history.replaceState(null, '', url);
  };

  const onSubmit = async (values: LicenseFormValues) => {
    if (!stripe || !elements || !selectedTierId) {
      setSubmitError('Payment system not ready. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create PaymentIntent via backend
      const payload: CreateLicenseCheckoutSessionRequest = {
        artwork_id: artworkId,
        pricing_tier_id: selectedTierId,
      };

      const response = (await createSession(payload).unwrap()) as LicenseCheckoutSessionResponse;

      if (!response.clientSecret) {
        throw new Error('No client secret received from server');
      }

      // 2. Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: values.company,
              // You can add email if you have user context
            },
          },
        }
      );

      if (stripeError) {
        setSubmitError(stripeError.message || 'Payment failed. Please try again.');
        console.error(stripeError);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Success → redirect to confirmation page
        router.push(`/license/success?order=${response.orderId}&artwork=${artworkId}`);
      } else {
        setSubmitError('Payment requires additional action. Check your bank/app.');
      }
    } catch (err: any) {
      console.error('License purchase error:', err);
      setSubmitError(
        err?.data?.error ||
          err?.message ||
          'An error occurred while processing your purchase. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading artwork details...</p>
      </div>
    );
  }

  if (isError || !artwork) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {(error as any)?.data?.message || 'Could not load artwork details.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (artwork.status !== 'published' || activeTiers.length === 0 || !selectedTier) {
    return (
      <Alert>
        <Info className="h-5 w-5" />
        <AlertTitle>Not Available</AlertTitle>
        <AlertDescription>
          This artwork is not currently available for licensing or has no active license options.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* LEFT COLUMN – Artwork + Form */}
      <div className="lg:col-span-2 space-y-10">
        {/* Artwork Info */}
        <Card>
          <CardHeader>
            <CardTitle>Artwork Information</CardTitle>
            <CardDescription>Review before licensing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-72 lg:w-80 aspect-square relative rounded-xl overflow-hidden border bg-muted/40 flex-shrink-0">
                <Image
                  src={artwork.thumbnail_url || artwork.file_url || '/placeholder-artwork.svg'}
                  alt={artwork.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{artwork.title}</h2>
                  <p className="text-muted-foreground mt-1">
                    by Creator • {artwork.creator_id.substring(0, 8)}…
                  </p>
                </div>
                {artwork.description && (
                  <p className="text-muted-foreground whitespace-pre-line">{artwork.description}</p>
                )}
                {artwork.categories?.length ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {artwork.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose License Type</CardTitle>
            <CardDescription>Select the license that best fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedTierId ?? null} // ← string | null
              onValueChange={handleTierChange}
              className="space-y-5"
            >
              {activeTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-lg border p-5 transition-all ${
                    selectedTierId === tier.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:border-muted-foreground/50 hover:bg-accent/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} className="mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor={`tier-${tier.id}`}
                          className="text-lg font-semibold cursor-pointer"
                        >
                          {capitalize(tier.license_type)}
                        </Label>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {formatPrice(tier.price_usd_cents)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ≈ {formatPrice(tier.price_inr_cents, 'INR')}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {tier.license_type === 'exclusive'
                          ? 'Exclusive perpetual rights – full ownership transfer'
                          : tier.license_type === 'commercial'
                            ? 'Commercial usage rights for business purposes'
                            : 'Personal, non-commercial use only'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Intended Use Form */}
        <Card>
          <CardHeader>
            <CardTitle>Intended Use Details</CardTitle>
            <CardDescription>
              Help us understand how you plan to use the artwork (required for licensing)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company / Organization *</Label>
                  <Input id="company" placeholder="Acme Corp" {...form.register('company')} />
                  {form.formState.errors.company && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website / Portfolio (optional)</Label>
                  <Input
                    id="website"
                    placeholder="https://your-site.com"
                    {...form.register('website')}
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intendedUsage">Intended Usage *</Label>
                <Textarea
                  id="intendedUsage"
                  placeholder="e.g. Print on merchandise, use in advertising campaign, website hero image..."
                  className="min-h-[140px]"
                  {...form.register('intendedUsage')}
                />
                {form.formState.errors.intendedUsage && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.intendedUsage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributionChannels">Distribution Channels (optional)</Label>
                <Textarea
                  id="distributionChannels"
                  placeholder="e.g. Instagram, TikTok, company website, physical prints..."
                  className="min-h-[100px]"
                  {...form.register('distributionChannels')}
                />
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="agreeToTerms"
                  checked={form.watch('agreeToTerms')}
                  onCheckedChange={(checked) => form.setValue('agreeToTerms', !!checked)}
                />
                <div className="grid gap-1 leading-none">
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the licensing terms & restrictions *
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    By proceeding, you accept all terms of the selected license type.
                  </p>
                  {form.formState.errors.agreeToTerms && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.agreeToTerms.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN – Summary + Payment */}
      <div className="space-y-8">
        <div className="lg:sticky lg:top-24 space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {capitalize(selectedTier.license_type)} License
                </span>
                <span className="text-xl font-bold">
                  {formatPrice(selectedTier.price_usd_cents)}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span>$15.00</span>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold">
                <span>Total (excl. tax)</span>
                <span>{formatPrice(selectedTier.price_usd_cents + 1500)}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                Taxes may apply based on your location • Prices shown in USD
              </p>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>Secure payment powered by Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Card Details</Label>
                <div className="p-4 border rounded-md bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#32325d',
                          '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#fa755a' },
                      },
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We never store your card details — processed securely by Stripe.
                </p>
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Payment Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button
            size="lg"
            className="w-full py-7 text-lg font-medium"
            disabled={
              isSubmitting ||
              isCreating ||
              !stripe ||
              !elements ||
              !selectedTierId ||
              !form.watch('agreeToTerms')
            }
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting || isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              'Pay & Obtain License'
            )}
          </Button>

          <div className="text-center space-y-4 text-sm">
            <p className="text-muted-foreground">Secure & encrypted payment • Powered by Stripe</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900">Protected Transaction</p>
                  <p className="text-green-800 text-sm mt-1">
                    Your payment information is fully encrypted and never touches our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LicenseArtworkPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <LayoutWrapper>
      <div className="container max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        {/* Back Navigation & Title */}
        <div className="mb-8">
          <Link
            href={`/gallery/artwork/${id}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artwork
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">License Artwork</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Select your license type and complete the secure payment process
        </p>

        <Elements stripe={stripePromise}>
          <LicenseFormContent />
        </Elements>
      </div>
    </LayoutWrapper>
  );
}
