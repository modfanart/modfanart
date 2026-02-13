import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ForBrandsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO */}
      <section className="w-full py-24 md:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <Badge variant="secondary" className="mb-4">
            For Brands
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Turn Fan Passion Into Licensed Revenue
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg">
            MOD enables brands to protect intellectual property, discover top fan talent, and unlock
            structured monetization through officially licensed collaborations.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/signup?type=brand">
              <Button size="lg">Join as a Brand</Button>
            </Link>

            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator />

      {/* VALUE PROPOSITION */}
      <section className="w-full py-20 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why MOD for Brands?</h2>
            <p className="mt-3 text-muted-foreground">
              Structured, compliant, and scalable fan licensing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>IP Protection</CardTitle>
                <CardDescription>
                  Monitor and manage fan art under a structured approval system.
                </CardDescription>
              </CardHeader>
              <CardContent>Reduce infringement risk while encouraging creativity.</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Revenue Streams</CardTitle>
                <CardDescription>
                  Monetize fan-created assets through official licensing.
                </CardDescription>
              </CardHeader>
              <CardContent>Convert community passion into measurable revenue.</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Talent Discovery</CardTitle>
                <CardDescription>
                  Identify high-performing artists within your fan ecosystem.
                </CardDescription>
              </CardHeader>
              <CardContent>Build long-term collaborations with proven creators.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* HOW IT WORKS */}
      <section className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <h3 className="text-xl font-semibold">Onboard & Define Guidelines</h3>
              <p className="text-muted-foreground mt-2">
                Set licensing rules, brand usage policies, and revenue terms.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <h3 className="text-xl font-semibold">Review & Approve</h3>
              <p className="text-muted-foreground mt-2">
                Evaluate fan submissions and officially license selected works.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <h3 className="text-xl font-semibold">Monetize & Scale</h3>
              <p className="text-muted-foreground mt-2">
                Launch licensed products and track performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="w-full py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-5xl">
                Ready to Transform Fan Art into Revenue?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/90 md:text-xl">
                Join MOD Platform today and build a compliant, scalable fan licensing ecosystem.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?type=brand">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Join as a Brand
                </Button>
              </Link>

              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
