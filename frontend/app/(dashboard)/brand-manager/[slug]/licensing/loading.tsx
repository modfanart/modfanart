import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function LicenseRequestsLoading() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-[120px] mb-1" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-[80px]" />
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-3">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-[150px] mb-2" />
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {Array(8)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-3 w-full" />
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2 w-full">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
