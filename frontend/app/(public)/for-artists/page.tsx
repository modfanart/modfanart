import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ForArtistsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* HERO */}
      <section className="w-full py-24 md:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          <Badge className="mb-4" variant="secondary">
            For Artists
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Turn Your Fan Art Into Officially Licensed Revenue
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg">
            Submit your fan creations, collaborate with brands, and earn through official licensing
            opportunities. MOD connects talented artists with the brands they love.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/signup?type=artist">
              <Button size="lg">Start as an Artist</Button>
            </Link>

            <Link href="/gallery">
              <Button size="lg" variant="outline">
                Explore Licensed Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator />

      {/* FEATURES */}
      <section className="w-full py-20 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Join MOD?</h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to monetize your creativity legally and professionally.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Official Licensing</CardTitle>
                <CardDescription>
                  Get your fan art approved and licensed through real brand partnerships.
                </CardDescription>
              </CardHeader>
              <CardContent>Protect your creativity while earning legitimately.</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monetization Opportunities</CardTitle>
                <CardDescription>
                  Earn royalties and exposure through brand collaborations.
                </CardDescription>
              </CardHeader>
              <CardContent>No more unpaid passion projects.</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direct Brand Access</CardTitle>
                <CardDescription>
                  Connect directly with verified brands looking for fan creativity.
                </CardDescription>
              </CardHeader>
              <CardContent>Showcase your work to decision-makers.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* HOW IT WORKS */}
      <section className="w-full py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <h3 className="text-xl font-semibold">Create & Submit</h3>
              <p className="text-muted-foreground mt-2">
                Upload your fan art for review and licensing approval.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <h3 className="text-xl font-semibold">Get Approved</h3>
              <p className="text-muted-foreground mt-2">
                Brands review and officially license selected works.
              </p>
            </div>

            <div>
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <h3 className="text-xl font-semibold">Earn & Grow</h3>
              <p className="text-muted-foreground mt-2">
                Monetize your art and build long-term brand relationships.
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
                Ready to Get Your Fan Art Licensed?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/90 md:text-xl">
                Join MOD today and turn your passion into officially recognized and monetized
                artwork.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?type=artist">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Join as an Artist
                </Button>
              </Link>

              <Link href="/gallery">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
