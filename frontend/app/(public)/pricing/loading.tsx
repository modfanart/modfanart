import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function PricingLoading() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="mx-auto mt-10 flex max-w-md justify-center">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="mx-auto mt-6 flex max-w-xs items-center justify-center">
        <Skeleton className="h-6 w-full rounded-lg" />
      </div>

      <div className="mt-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-10 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-2" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
