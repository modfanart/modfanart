import { Skeleton } from '@/components/ui/skeleton';

export default function SupportLoading() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl text-center mb-16">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-2/4 mx-auto" />
      </div>

      {/* Quick Help Section */}
      <div className="mb-16">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="mb-16">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </div>
      </div>

      {/* Support Hours */}
      <div className="mb-16 bg-muted p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Skeleton className="h-10 w-10 mr-4 rounded-full" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full md:w-auto">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mb-16">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border-b pb-4">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
        </div>
      </div>

      {/* Support Resources */}
      <div>
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
