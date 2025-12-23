import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Info, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

// This would normally come from a database
const getArtworkData = (id: string) => {
  const allArtwork = [
    {
      id: "avail-1",
      title: "Astro Boy Pixel Art",
      artist: "Thomas Wright",
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/astroboy%201080X1350-06.jpg-HGXeQRkp0BweHMKLiYilSQYIsQUaob.jpeg",
      ipOwner: "Tezuka Productions",
      price: "$150",
      basePrice: 150,
      licenseType: "Commercial",
      description: "A minimalist, geometric illustration of the iconic Astro Boy character on a blue background.",
      tags: ["anime", "character", "geometric"],
      licenseOptions: [
        {
          id: "personal",
          name: "Personal Use",
          description: "Use for personal, non-commercial projects",
          price: 50,
          duration: "Perpetual",
          restrictions: ["No commercial use", "No modifications", "Attribution required"],
        },
        {
          id: "commercial-basic",
          name: "Basic Commercial",
          description: "Use for commercial projects with limited distribution",
          price: 150,
          duration: "1 year",
          restrictions: ["Limited to 1,000 units", "No resale of the license", "Attribution required"],
        },
        {
          id: "commercial-extended",
          name: "Extended Commercial",
          description: "Use for commercial projects with wider distribution",
          price: 300,
          duration: "2 years",
          restrictions: ["Limited to 10,000 units", "No resale of the license", "Attribution required"],
        },
        {
          id: "commercial-unlimited",
          name: "Unlimited Commercial",
          description: "Unlimited commercial use with exclusive rights",
          price: 750,
          duration: "Perpetual",
          restrictions: ["No resale of the license", "Attribution required"],
        },
      ],
    },
    // Add more artwork data as needed
  ]

  return allArtwork.find((art) => art.id === id)
}

export default function LicenseCheckoutPage({ params }: { params: { id: string } }) {
  const artwork = getArtworkData(params.id)

  if (!artwork) {
    return notFound()
  }

  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-6">
          <Link
            href={`/gallery/artwork/${params.id}`}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Artwork
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">License Artwork</h1>
        <p className="text-muted-foreground mb-8">Complete your licensing agreement for this artwork</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Artwork preview and details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>Review the artwork you're licensing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 bg-black rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h2 className="text-xl font-bold">{artwork.title}</h2>
                    <p className="text-muted-foreground mb-2">by {artwork.artist}</p>
                    <p className="mb-4">{artwork.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP Owner:</span>
                        <span className="font-medium">{artwork.ipOwner}</span>
                      </div>
                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original License Type:</span>
                        <span className="font-medium">{artwork.licenseType}</span>
                      </div>
                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tags:</span>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {artwork.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>License Options</CardTitle>
                <CardDescription>Select the license that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="commercial-basic" className="space-y-4">
                  {artwork.licenseOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="grid gap-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={option.id} className="font-medium text-base">
                            {option.name}
                          </Label>
                          <span className="font-bold">${option.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                            Duration: {option.duration}
                          </span>
                          {option.restrictions.map((restriction, index) => (
                            <span
                              key={index}
                              className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                            >
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Licensing Information</CardTitle>
                <CardDescription>Tell us how you plan to use this artwork</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input id="company" placeholder="Your company name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="Your website" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage">Intended Usage</Label>
                    <Textarea
                      id="usage"
                      placeholder="Describe how you plan to use this artwork (e.g., merchandise, marketing materials, website)"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distribution">Distribution Channels</Label>
                    <Textarea
                      id="distribution"
                      placeholder="List the channels where this artwork will be distributed (e.g., online store, physical retail)"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox id="terms" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the licensing terms and conditions
                      </label>
                      <p className="text-sm text-muted-foreground">
                        By checking this box, you agree to comply with all the terms and restrictions of the selected
                        license.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order summary and payment */}
          <div>
            <div className="lg:sticky lg:top-20">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>License Fee (Basic Commercial)</span>
                      <span>${artwork.licenseOptions[1].price}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span>$15.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${artwork.licenseOptions[1].price + 15}.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="credit-card">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                      <TabsTrigger value="invoice">Invoice</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credit-card" className="space-y-4 pt-4">
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
                        <Label htmlFor="name">Name on Card</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                    </TabsContent>

                    <TabsContent value="invoice" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="billing-email">Billing Email</Label>
                        <Input id="billing-email" placeholder="billing@company.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="po-number">Purchase Order Number (Optional)</Label>
                        <Input id="po-number" placeholder="PO-12345" />
                      </div>

                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Invoice Information</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                Invoices are sent within 1 business day and have Net-30 payment terms. License will be
                                activated after payment is received.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button className="w-full" size="lg">
                Complete Purchase
              </Button>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>
                  Need help?{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact our licensing team
                  </Link>
                </p>
              </div>

              <div className="mt-6 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Secure Transaction</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Your payment information is encrypted and secure. All transactions are protected by our secure
                        payment system.
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
  )
}

