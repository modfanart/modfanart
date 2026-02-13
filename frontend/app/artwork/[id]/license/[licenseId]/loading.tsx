import { LayoutWrapper } from "@/components/layout-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LicenseCheckoutLoading() {
  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>

        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Artwork preview and details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="w-full md:w-1/3 aspect-square rounded-lg" />
                  <div className="w-full md:w-2/3 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-px w-full" />

                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-px w-full" />

                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-4 w-4 mt-1 rounded-full" />
                      <div className="grid gap-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="mt-1 flex gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-40" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-24 w-full" />
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="grid gap-1.5 leading-none">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order summary and payment */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-px w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Skeleton className="h-12 w-full mb-4" />

            <div className="mt-4 text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>

            <Skeleton className="h-24 w-full mt-6 rounded-md" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

