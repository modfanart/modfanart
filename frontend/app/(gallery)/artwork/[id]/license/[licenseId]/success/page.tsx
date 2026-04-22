import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LicenseSuccessPage() {
  return (
    <LayoutWrapper>
      <div className="container max-w-3xl py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">License Purchase Successful!</h1>
          <p className="text-muted-foreground">Your license has been successfully processed</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>License Details</CardTitle>
            <CardDescription>Your license information and next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">License ID</p>
                  <p className="font-medium">LIC-20240306-1234</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">March 6, 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">License Type</p>
                  <p className="font-medium">Basic Commercial</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">1 year (Expires: March 6, 2025)</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Artwork</p>
                <p className="font-medium">Astro Boy Pixel Art by Thomas Wright</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">License Restrictions</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Limited to 1,000 units</li>
                  <li>No resale of the license</li>
                  <li>Attribution required</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-3">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Download Your Assets</h3>
                  <p className="text-muted-foreground">
                    Access high-resolution files of your licensed artwork
                  </p>
                  <Button variant="outline" className="mt-2">
                    Download Files
                  </Button>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-3">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Review License Agreement</h3>
                  <p className="text-muted-foreground">
                    Read the full terms of your license agreement
                  </p>
                  <Button variant="outline" className="mt-2">
                    View Agreement
                  </Button>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white mr-3">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Manage Your Licenses</h3>
                  <p className="text-muted-foreground">
                    View and manage all your licensed artwork in one place
                  </p>
                  <Button variant="outline" className="mt-2">
                    Go to My Licenses
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/gallery/available">Browse More Artwork</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
