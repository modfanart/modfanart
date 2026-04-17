import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Shield, Zap, ArrowRight, DollarSign } from 'lucide-react';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
// Featured artwork data (subset of the full gallery)
const featuredArtwork = [
  {
    id: 'art-4',
    title: 'Nature Hulk',
    artist: 'Sarah Johnson',
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
    ipOwner: 'Marvel Comics',
  },
  {
    id: 'art-8',
    title: 'Ahsoka Tano',
    artist: 'Alex Rivera',
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png',
    ipOwner: 'Lucasfilm',
  },
  {
    id: 'art-11',
    title: 'Dark Knight',
    artist: 'Thomas Wayne',
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Absolute_Batman_low.jpg-jbjBkbHD8un1TKig37wzR4G3RvZFbk.jpeg',
    ipOwner: 'DC Comics',
  },
  {
    id: 'art-10',
    title: 'Cherry - Cytus II',
    artist: 'Wei Chen',
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHERRY-CYTUS-II.jpg-KZxxwPf0sVDgP8RhQq8p5D6Rm4r1cv.jpeg',
    ipOwner: 'Rayark Inc.',
  },
];

export default function Home() {
  return (
    <LayoutWrapper>
      <div className="flex flex-col items-center">
        {/* Hero section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    AI-Powered Fan Art Licensing
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connecting brands, creators, and artists through an automated platform for fan
                    art submission, licensing, and compliance.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/learn-more">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artwork Preview */}
        <section className="w-full py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Featured Artwork</h2>
              <Link
                href="/gallery/featured"
                className="flex items-center text-primary hover:underline"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredArtwork.map((artwork) => (
                <Link key={artwork.id} href={`/gallery/artwork/${artwork.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || '/placeholder.svg'}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{artwork.title}</CardTitle>
                      <CardDescription>
                        By {artwork.artist}
                        <br />
                        {artwork.ipOwner}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Powerful Features for All Users
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform streamlines the fan art submission, review, and licensing process
                  with AI-powered tools.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle>AI-Powered Review</CardTitle>
                  <CardDescription>
                    Automated content moderation and IP violation detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Our AI systems analyze submissions for compliance with brand guidelines, saving
                    time and ensuring consistency.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Shield className="h-5 w-5" />
                  </div>
                  <CardTitle>IP Protection</CardTitle>
                  <CardDescription>Legitimate licensing for fan art creators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Protect intellectual property through official licensing channels while giving
                    fans direct access to commercial opportunities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <CardTitle>Revenue Opportunities</CardTitle>
                  <CardDescription>Monetization for artists and brands alike</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Create new revenue streams through licensed fan art while building stronger
                    connections between creators and their audience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* User roles section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Who Uses Our Platform
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform caters to multiple user roles, each with specialized features.
                </p>
              </div>
            </div>
            <div className="grid gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Brands & IP Holders</h3>
                <p className="text-center text-muted-foreground">
                  Review and approve fan art, manage licenses, and protect IP assets through our
                  comprehensive dashboard.
                </p>
                <Link href="/for-brands">
                  <Button>Learn More</Button>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Content Creators</h3>
                <p className="text-center text-muted-foreground">
                  Manage fan art related to your content, create monetization opportunities, and
                  engage with your community.
                </p>
                <Link href="/for-creators-info">
                  <Button>Learn More</Button>
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Artists</h3>
                <p className="text-center text-muted-foreground">
                  Submit your fan art for official approval, gain exposure, and receive licensing
                  opportunities from brands.
                </p>
                <Link href="/for-artists">
                  <Button>Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join our platform today and revolutionize the way you manage fan art licensing.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg">Sign Up Now</Button>
                </Link>
                <Link href="/contact-sales">
                  <Button size="lg" variant="outline">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LayoutWrapper>
  );
}
