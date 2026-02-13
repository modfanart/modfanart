import { LayoutWrapper } from "@/components/layout-wrapper"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArtworkLoading() {
  return (
    <LayoutWrapper>
      <div className="container py-10">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />

          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />

            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-40" />
            </div>

            <Skeleton className="h-24 w-full mb-6" />

            <Skeleton className="h-20 w-full mb-6" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-px w-full" />

              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-px w-full" />

              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-px w-full" />

              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

