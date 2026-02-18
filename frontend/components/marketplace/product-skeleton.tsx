import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Skeleton className="mb-4 h-8 w-32" />

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Product Images Skeleton */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="flex flex-col lg:w-1/2">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="mt-2 h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>

              <Skeleton className="mt-4 h-4 w-32" />
              <Skeleton className="mt-4 h-24 w-full" />

              <div className="mt-6 space-y-6">
                <div>
                  <Skeleton className="mb-3 h-5 w-16" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-14 rounded-md" />
                    ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="mb-3 h-5 w-16" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-20 rounded-md" />
                    ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="mb-3 h-5 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-8 w-36" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>

            <Skeleton className="my-8 h-px w-full" />

            <div>
              <Skeleton className="h-10 w-64" />
              <Skeleton className="mt-4 h-32 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Skeleton */}
      <Skeleton className="mt-16 h-8 w-48" />
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg md:col-span-2" />
      </div>

      {/* Related Products Skeleton */}
      <Skeleton className="mt-16 h-8 w-48" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
