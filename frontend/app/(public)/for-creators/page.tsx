import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Shield, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ForCreatorsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* HERO */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-muted/40 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit">
                  For Content Creators
                </Badge>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
                  Engage Fans. Protect Your IP. Earn Royalties.
                </h1>

                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Turn fan creativity into structured licensing opportunities while maintaining full
                  control over your intellectual property.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup?type=creator">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>

                  <Link href="/resources/guidelines">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      View Guidelines
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  alt="Creator Collaboration"
                  src="/placeholder.svg"
                  className="rounded-2xl shadow-xl border bg-muted"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <h2 className="text-3xl font-bold">Why Creators Choose MOD</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A structured system designed to monetize fan art while protecting your brand.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="rounded-2xl">
                <CardHeader>
                  <DollarSign className="h-8 w-8 text-primary" />
                  <CardTitle>Monetize Fan Art</CardTitle>
                  <CardDescription>
                    Earn royalties when licensed fan artwork featuring your content generates
                    revenue.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary" />
                  <CardTitle>Deepen Community</CardTitle>
                  <CardDescription>
                    Encourage creativity while strengthening engagement with your audience.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary" />
                  <CardTitle>IP Protection</CardTitle>
                  <CardDescription>
                    Set clear licensing guidelines and maintain full control over how your content
                    is used.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full py-20 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-14">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground">
                Three simple steps to unlock structured fan art licensing.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Register Your Content',
                  desc: 'Create your account and register the IP you want to enable for licensing.',
                },
                {
                  step: '02',
                  title: 'Define Guidelines',
                  desc: 'Set commercial usage rules, royalty splits, and licensing permissions.',
                },
                {
                  step: '03',
                  title: 'Earn Royalties',
                  desc: 'Receive royalties when licensed artwork featuring your content generates revenue.',
                },
              ].map((item) => (
                <div key={item.step} className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST / FEATURE HIGHLIGHTS */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Built for Serious Creators</h2>

                <div className="space-y-4">
                  {[
                    'Transparent royalty tracking',
                    'Clear commercial licensing workflows',
                    'Secure IP registration system',
                    'Direct brand collaboration opportunities',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-muted p-8 text-center">
                <h3 className="text-xl font-semibold mb-3">Ready to unlock new revenue streams?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of creators turning fan engagement into sustainable income.
                </p>
                <Link href="/signup?type=creator">
                  <Button size="lg" className="w-full">
                    Join as a Creator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full py-24 bg-gradient-to-br from-primary to-primary/80">
          <div className="container px-4 md:px-6 text-center space-y-6">
            <h2 className="text-4xl font-bold text-white">Ready to Engage Your Fans?</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Join MOD Platform and transform fan creativity into licensed, revenue-generating
              opportunities.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Link href="/signup?type=creator">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Sign Up Now
                </Button>
              </Link>

              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
