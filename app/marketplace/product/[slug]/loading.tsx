import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <Skeleton className="mb-4 h-10 w-32" />

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Product Images Skeleton */}
          <div className="flex flex-col gap-4 lg:w-1/2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="flex flex-col lg:w-1/2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-2 h-4 w-1/4" />
            <Skeleton className="mt-4 h-24 w-full" />

            <div className="mt-6 space-y-6">
              <div>
                <Skeleton className="mb-3 h-5 w-16" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-14 rounded-md" />
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="mb-3 h-5 w-16" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-md" />
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="mb-3 h-5 w-16" />
                <Skeleton className="h-10 w-32" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

