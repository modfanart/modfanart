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
import { ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

type LicenseOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  restrictions: string[];
};

type Artwork = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  ipOwner: string;
  price: string;
  basePrice: number;
  licenseType: string;
  description: string;
  tags: string[];
  licenseOptions: LicenseOption[];
};

const allArtwork: Artwork[] = [
  {
    id: 'avail-1',
    title: 'Classic Astro Boy Monochrome Portrait',
    artist: 'Soulhouse Design',
    imageUrl:
      'https://m.media-amazon.com/images/I/51d-jOmMeSL.jpg_BO30,255,255,255_UF900,850_SR1910,1000,0,C_QL100_.jpg',
    ipOwner: 'Tezuka Productions',
    price: '$150',
    basePrice: 150,
    licenseType: 'Commercial',
    description:
      'A stunning monochrome poster-style portrait of classic Astro Boy, capturing the nostalgic essence of the original anime hero with clean lines and dramatic shading.',
    tags: ['anime', 'monochrome', 'portrait', 'classic', 'poster'],
    licenseOptions: [
      {
        id: 'personal',
        name: 'Personal Use',
        description: 'Use for personal, non-commercial projects',
        price: 50,
        duration: 'Perpetual',
        restrictions: ['No commercial use', 'No modifications', 'Attribution required'],
      },
      {
        id: 'commercial-basic',
        name: 'Basic Commercial',
        description: 'Use for commercial projects with limited distribution',
        price: 150,
        duration: '1 year',
        restrictions: [
          'Limited to 1,000 units',
          'No resale of the license',
          'Attribution required',
        ],
      },
      {
        id: 'commercial-extended',
        name: 'Extended Commercial',
        description: 'Use for commercial projects with wider distribution',
        price: 300,
        duration: '2 years',
        restrictions: [
          'Limited to 10,000 units',
          'No resale of the license',
          'Attribution required',
        ],
      },
      {
        id: 'commercial-unlimited',
        name: 'Unlimited Commercial',
        description: 'Unlimited commercial use with exclusive rights',
        price: 750,
        duration: 'Perpetual',
        restrictions: ['No resale of the license', 'Attribution required'],
      },
    ],
  },
  {
    id: 'avail-2',
    title: 'Astro Boy Flying Action Silhouette',
    artist: 'Decal Masters',
    imageUrl:
      'https://www.shutterstock.com/image-vector/cartoon-silhouette-superhero-flying-600w-414271210.jpg',
    ipOwner: 'Tezuka Productions',
    price: '$180',
    basePrice: 180,
    licenseType: 'Commercial',
    description:
      'Dynamic flying action pose of Astro Boy in bold silhouette style, ideal for stickers, decals, apparel, and merchandise designs.',
    tags: ['anime', 'silhouette', 'flying', 'action', 'decal'],
    licenseOptions: [
      {
        id: 'personal',
        name: 'Personal Use',
        description: 'Personal non-commercial use only',
        price: 60,
        duration: 'Perpetual',
        restrictions: ['No commercial use', 'Attribution required'],
      },
      {
        id: 'commercial-basic',
        name: 'Basic Commercial',
        description: 'Limited commercial distribution',
        price: 180,
        duration: '1 year',
        restrictions: ['Limited to 2,000 units', 'Attribution required'],
      },
      {
        id: 'commercial-extended',
        name: 'Extended Commercial',
        description: 'Broader commercial use',
        price: 350,
        duration: '2 years',
        restrictions: ['Limited to 15,000 units'],
      },
      {
        id: 'commercial-unlimited',
        name: 'Unlimited Commercial',
        description: 'Full unlimited commercial rights',
        price: 800,
        duration: 'Perpetual',
        restrictions: ['Full rights included'],
      },
    ],
  },
  {
    id: 'avail-3',
    title: 'Modern Stylized Astro Boy Fan Art',
    artist: 'Contemporary Anime Collective',
    imageUrl: 'https://tokyo-in-pics.com/wp-content/uploads/2024/06/Astro-Boy.webp',
    ipOwner: 'Tezuka Productions',
    price: '$200',
    basePrice: 200,
    licenseType: 'Commercial',
    description:
      'A fresh modern fan art redraw of Astro Boy with updated styling, dynamic pose, and detailed shading while staying true to the original character design.',
    tags: ['anime', 'modern', 'fan art', 'stylized', 'dynamic'],
    licenseOptions: [
      {
        id: 'personal',
        name: 'Personal Use',
        description: 'For personal projects only',
        price: 70,
        duration: 'Perpetual',
        restrictions: ['No commercial use'],
      },
      {
        id: 'commercial-basic',
        name: 'Basic Commercial',
        description: 'Standard commercial license',
        price: 200,
        duration: '1 year',
        restrictions: ['Limited distribution'],
      },
      {
        id: 'commercial-extended',
        name: 'Extended Commercial',
        description: 'Extended rights for merchandise',
        price: 400,
        duration: 'Perpetual',
        restrictions: ['Merchandise permitted'],
      },
      {
        id: 'commercial-unlimited',
        name: 'Unlimited Commercial',
        description: 'Complete commercial freedom',
        price: 900,
        duration: 'Perpetual',
        restrictions: ['Exclusive rights available'],
      },
    ],
  },
];

const getArtworkData = (id: string): Artwork | undefined => {
  return allArtwork.find((art) => art.id === id);
};

export default async function LicenseCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtworkData(id);

  if (!artwork) {
    notFound();
  }

  // Safely select default option - always exists since every artwork has at least 4 options
  const defaultOption = artwork.licenseOptions.find((opt) => opt.id === 'commercial-basic')!;

  return (
    <LayoutWrapper>
      <div className="container py-10 max-w-7xl">
        <div className="mb-6">
          <Link
            href={`/gallery/artwork/${id}`}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artwork
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">License Artwork</h1>
        <p className="text-muted-foreground mb-8">
          Complete your licensing agreement for this artwork
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Artwork Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>Review the artwork you're licensing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 bg-muted/30 rounded-xl overflow-hidden border">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        className="object-contain p-6"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{artwork.title}</h2>
                    <p className="text-lg text-muted-foreground mb-4">by {artwork.artist}</p>
                    <p className="mb-6 leading-relaxed">{artwork.description}</p>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP Owner</span>
                        <span className="font-medium">{artwork.ipOwner}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base License Type</span>
                        <span className="font-medium">{artwork.licenseType}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">Tags</span>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {artwork.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* License Options Card */}
            <Card>
              <CardHeader>
                <CardTitle>License Options</CardTitle>
                <CardDescription>Select the license that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue={defaultOption.id} className="space-y-5">
                  {artwork.licenseOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={option.id}
                            className="text-lg font-semibold cursor-pointer"
                          >
                            {option.name}
                          </Label>
                          <span className="text-2xl font-bold">${option.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Duration: {option.duration}
                          </Badge>
                          {option.restrictions.map((restriction, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {restriction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Licensing Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Licensing Information</CardTitle>
                <CardDescription>Provide details about your intended use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Organization *</Label>
                    <Input id="company" placeholder="Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage">Intended Usage *</Label>
                  <Textarea
                    id="usage"
                    placeholder="Describe how you'll use this artwork (e.g., t-shirts, website banners, app icons)"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distribution">Distribution Channels</Label>
                  <Textarea
                    id="distribution"
                    placeholder="e.g., online store, physical retail, social media"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox id="terms" />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium">
                      I agree to the licensing terms and conditions *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By checking this, you agree to comply with all restrictions of the selected
                      license.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary & Payment */}
          <div className="space-y-8">
            <div className="lg:sticky lg:top-20">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>License Fee ({defaultOption.name})</span>
                    <span className="font-semibold">${defaultOption.price}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Service Fee</span>
                    <span>$15.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${defaultOption.price + 15}.00</span>
                  </div>
                  <p className="text-sm text-muted-foreground pt-2">
                    Taxes may apply based on your location.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="credit-card" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                      <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credit-card" className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Name on Card</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                    </TabsContent>

                    <TabsContent value="invoice" className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="billing-email">Billing Email *</Label>
                        <Input id="billing-email" type="email" placeholder="billing@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="po-number">Purchase Order Number</Label>
                        <Input id="po-number" placeholder="PO-123456" />
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Invoice Payment</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Invoices are sent within 1 business day with Net-30 terms. Your
                              license activates upon payment receipt.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full text-lg py-6">
                Complete Purchase
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Need assistance?{' '}
                <Link href="/support" className="text-primary hover:underline">
                  Contact support
                </Link>
              </p>

              <div className="mt-6 rounded-lg bg-green-50 p-4 border border-green-200">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Secure & Protected</p>
                    <p className="text-sm text-green-700 mt-1">
                      All transactions are encrypted and processed securely. Your data is protected.
                    </p>
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
