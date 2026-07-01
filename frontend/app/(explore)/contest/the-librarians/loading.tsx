import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function OpportunityDetailLoading() {
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="mb-6 aspect-video w-full rounded-lg" />

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-10 w-[70%]" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="mb-8">
            <div className="mb-4 flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-[95%]" />
              <Skeleton className="h-6 w-[90%]" />
              <Skeleton className="h-6 w-[85%]" />
              <Skeleton className="h-6 w-[80%]" />
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <div className="flex flex-wrap justify-end gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="mx-auto h-4 w-[80%]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
