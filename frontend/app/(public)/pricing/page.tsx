'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Zap, Shield, CreditCard, Building2 } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSubscription = async (tier: string) => {
    try {
      setIsLoading(tier);

      // In a real app, you would get the userId from your auth system
      const userId = 'user_123';

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          userId,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      router.push(data.url);
    } catch (error) {
      console.error('Error creating subscription:', error);
      setIsLoading(null);
      // In a real app, you would show an error message
    }
  };

  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Pricing Plans</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the perfect plan for your fan art licensing needs
        </p>
      </div>

      <div className="mx-auto mt-10 flex justify-center">
        <Tabs defaultValue="artists" className="w-full max-w-5xl">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="artists">For Artists</TabsTrigger>
              <TabsTrigger value="brands">For Brands & IP Holders</TabsTrigger>
            </TabsList>
          </div>

          <div className="mx-auto mb-10 flex max-w-xs items-center justify-center space-x-2">
            <span
              className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'annual'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
            />
            <span
              className={`text-sm ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              Annual
              <Badge
                variant="outline"
                className="ml-2 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
              >
                Save 20%
              </Badge>
            </span>
          </div>

          <TabsContent value="artists">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {/* Tier 1: Free */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">
                    Perfect for artists looking to get started with fan art licensing
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Unlimited submissions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>AI-powered screening</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Standard revenue share (70/30)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/signup?tier=free">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Tier 1 Premium: Premium Artist */}
              <Card className="flex flex-col border-primary relative">
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                  Most Popular
                </div>
                <CardHeader className="bg-primary/10">
                  <CardTitle>Premium Artist</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    ${billingCycle === 'monthly' ? '29' : '23'}
                    <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">
                    For serious artists looking to maximize their licensing potential
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Everything in Free tier</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Priority review process</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Enhanced revenue share (80/20)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Advanced analytics dashboard</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Direct communication with brands</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscription('premium_artist')}
                    disabled={isLoading === 'premium_artist'}
                  >
                    {isLoading === 'premium_artist' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Tier 1 Pro: Professional Artist */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    ${billingCycle === 'monthly' ? '49' : '39'}
                    <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">
                    For full-time artists with high-volume licensing needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Everything in Premium tier</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Highest revenue share (85/15)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Featured artist promotion</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Early access to brand partnerships</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscription('professional_artist')}
                    disabled={isLoading === 'professional_artist'}
                  >
                    {isLoading === 'professional_artist' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="brands">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {/* Tier 2: Creator */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Creator</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0<span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">
                    For content creators and small IP holders
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>No upfront cost</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Revenue share model (70/30)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Basic IP protection tools</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Standard approval workflow</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Basic analytics dashboard</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/signup?role=creator">Sign Up as Creator</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Tier 2 Premium: Brand */}
              <Card className="flex flex-col border-primary relative">
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                  Most Popular
                </div>
                <CardHeader className="bg-primary/10">
                  <CardTitle>Brand</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    ${billingCycle === 'monthly' ? '199' : '159'}
                    <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                  </div>
                  <CardDescription className="mt-2">
                    For established brands and medium-sized IP holders
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Lower revenue share (80/20)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Advanced IP protection tools</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Custom brand guidelines integration</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Priority approval workflow</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Comprehensive analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscription('brand')}
                    disabled={isLoading === 'brand'}
                  >
                    {isLoading === 'brand' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Tier 3: Enterprise */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    Custom
                    <span className="ml-1 text-xl font-medium text-muted-foreground">/year</span>
                  </div>
                  <CardDescription className="mt-2">
                    For large IP holders and brands with extensive licensing needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Everything in Brand tier</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Lowest revenue share rates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>API access for integration</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                      <span>Custom reporting and analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/contact-sales">Contact Sales</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">All Plans Include</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI-Powered Screening</h3>
            <p className="text-sm text-muted-foreground">
              Automated content moderation and IP compliance checking
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Legal Protection</h3>
            <p className="text-sm text-muted-foreground">
              Secure licensing agreements and IP protection tools
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              Automated royalty distribution and payment processing
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl rounded-lg bg-primary/5 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-2">Need a custom solution?</h2>
            <p className="text-muted-foreground mb-4">
              Our enterprise plans are tailored to your specific needs. Contact our sales team to
              discuss a custom solution for your organization.
            </p>
            <Button asChild>
              <Link href="/contact-sales">Contact Sales</Link>
            </Button>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">What is the revenue share model?</h3>
            <p className="text-muted-foreground">
              Our revenue share model splits the earnings from licensed fan art between the artist,
              the IP holder, and our platform. The exact percentages vary by plan, with higher-tier
              plans offering more favorable rates to both artists and IP holders.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">Can I upgrade or downgrade my plan?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at
              the start of your next billing cycle. Upgrades give you immediate access to new
              features.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">
              Is there a limit to how many submissions I can make?
            </h3>
            <p className="text-muted-foreground">
              No, all plans include unlimited submissions. However, higher-tier plans offer priority
              review, meaning your submissions will be processed faster.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium mb-2">How do payments work for licensed artwork?</h3>
            <p className="text-muted-foreground">
              When your artwork is licensed, we handle all payment processing and automatically
              distribute royalties based on your plan's revenue share model. Payments are made
              monthly for all sales that occurred in the previous month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
