// app/artwork/[id]/license/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useGetArtworkQuery } from '@/services/api/artworkApi';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Artwork, ArtworkPricingTier } from '@/services/api/artworkApi';

// ────────────────────────────────────────────────
// Form Schema – fixed (boolean + refine)
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

const capitalize = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1) : '');

const getDefaultTier = (tiers: ArtworkPricingTier[] = []): ArtworkPricingTier | undefined => {
  const active = tiers.filter((t) => t.is_active);
  if (active.length === 0) return undefined;
  return (
    active.find((t) => t.license_type === 'commercial') ||
    active.find((t) => t.license_type === 'personal') ||
    active[0]
  );
};

export default function LicenseArtworkPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const artworkId = params.id as string;
  const preselectedTierId = searchParams.get('tier');

  const {
    data: artwork,
    isLoading,
    isError,
    error,
  } = useGetArtworkQuery(artworkId, {
    skip: !artworkId,
  });

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

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

  // Sync selected tier from URL or fallback
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

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="container max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-80 w-full rounded-xl" />
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (isError || !artwork) {
    return (
      <LayoutWrapper>
        <div className="container max-w-7xl py-20 px-4 text-center">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as any)?.data?.message || 'Could not load artwork details.'}
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/gallery/featured">Back to Gallery</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  if (artwork.status !== 'published') {
    return (
      <LayoutWrapper>
        <div className="container max-w-7xl py-20 px-4 text-center">
          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>Not Available</AlertTitle>
            <AlertDescription>
              This artwork is not currently available for licensing ({artwork.status}).
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-6">
            <Link href={`/gallery/artwork/${artworkId}`}>Back to Artwork</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const activeTiers = artwork.pricing_tiers?.filter((t) => t.is_active) ?? [];
  if (activeTiers.length === 0) {
    return (
      <LayoutWrapper>
        <div className="container max-w-7xl py-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">No Licensing Options</h2>
          <p className="text-muted-foreground mb-8">
            This artwork does not have any active pricing tiers at the moment.
          </p>
          <Button asChild>
            <Link href={`/gallery/artwork/${artworkId}`}>Back to Artwork</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const selectedTier = activeTiers.find((t) => t.id === selectedTierId) ?? activeTiers[0];

  if (!selectedTier) {
    return (
      <LayoutWrapper>
        <div className="container max-w-7xl py-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">No valid license tier available</h2>
          <Button asChild>
            <Link href={`/gallery/artwork/${artworkId}`}>Back to Artwork</Link>
          </Button>
        </div>
      </LayoutWrapper>
    );
  }

  const handleTierChange = (tierId: string) => {
    setSelectedTierId(tierId);
    const url = new URL(window.location.href);
    url.searchParams.set('tier', tierId);
    window.history.replaceState(null, '', url);
  };

  const onSubmit = (values: LicenseFormValues) => {
    console.log('License request submitted:', {
      artworkId,
      tierId: selectedTier.id,
      ...values,
    });
    // → replace with real API call / payment flow
    alert('License request submitted! (demo mode)');
  };

  return (
    <LayoutWrapper>
      <div className="container max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/gallery/artwork/${artworkId}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artwork
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">License Artwork</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Select your preferred license and provide usage details
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT – Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Artwork card */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Artwork Information</CardTitle>
                <CardDescription>Review before proceeding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-muted/40 rounded-xl overflow-hidden border aspect-square relative">
                    <Image
                      src={artwork.thumbnail_url || artwork.file_url || '/placeholder-artwork.svg'}
                      alt={artwork.title}
                      fill
                      className="object-contain p-6"
                      priority
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{artwork.title}</h2>
                      <p className="text-muted-foreground mt-1.5">
                        by Creator • {artwork.creator_id.substring(0, 8)}…
                      </p>
                    </div>

                    {artwork.description && (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {artwork.description}
                      </p>
                    )}

                    {artwork.categories?.length ? (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Categories
                        </h4>
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

            {/* License options */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Choose License Type</CardTitle>
                <CardDescription>Select the license that best matches your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedTierId ?? null}
                  onValueChange={handleTierChange}
                  className="space-y-5"
                >
                  {activeTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`rounded-lg border p-5 transition-colors ${
                        selectedTierId === tier.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent/60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={tier.id} id={`tier-${tier.id}`} className="mt-1.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
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
                              ? 'Exclusive perpetual rights'
                              : tier.license_type === 'commercial'
                                ? 'Commercial usage rights'
                                : 'Personal non-commercial use'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Form – intended use */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle>Intended Use</CardTitle>
                <CardDescription>Please provide details about your project</CardDescription>
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
                      <Label htmlFor="website">Website / Portfolio</Label>
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
                      placeholder="e.g., Print on 500 t-shirts, use as website hero banner..."
                      className="min-h-[120px]"
                      {...form.register('intendedUsage')}
                    />
                    {form.formState.errors.intendedUsage && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.intendedUsage.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distributionChannels">Distribution Channels</Label>
                    <Textarea
                      id="distributionChannels"
                      placeholder="e.g., Online store, Instagram, TikTok ads..."
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
                        By proceeding, you agree to comply with all terms of the selected license.
                      </p>
                      {form.formState.errors.agreeToTerms && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.agreeToTerms.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 lg:hidden">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT – Summary & Payment */}
          <div className="space-y-8">
            <div className="lg:sticky lg:top-24 space-y-8">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{capitalize(selectedTier.license_type)} License</span>
                    <span className="text-xl font-bold">
                      {formatPrice(selectedTier.price_usd_cents)}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Service Fee</span>
                    <span>$15.00</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selectedTier.price_usd_cents + 1500)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Taxes may apply depending on your location • Prices shown in USD
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="credit-card">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                      <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credit-card" className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="4242 4242 4242 4242" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" maxLength={4} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                    </TabsContent>

                    <TabsContent value="invoice" className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="billing-email">Billing Email *</Label>
                        <Input
                          id="billing-email"
                          type="email"
                          placeholder="billing@yourcompany.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="po-number">Purchase Order Number (optional)</Label>
                        <Input id="po-number" placeholder="PO-2025-789" />
                      </div>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Net-30 invoice will be sent within 24 hours. License activates upon
                          payment.
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Submit button – outside form → manual trigger */}
              <Button
                type="button"
                size="lg"
                className="w-full py-7 text-lg"
                disabled={form.formState.isSubmitting || !selectedTierId}
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>

              <div className="text-center space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Need help?{' '}
                  <Link href="/support" className="text-primary hover:underline">
                    Contact support
                  </Link>
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Secure Payment</p>
                      <p className="text-green-800 text-sm mt-1">
                        All transactions are encrypted and processed securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
