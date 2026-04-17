import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ComplianceLoading() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="mt-2 h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-7 w-[100px]" />
              <Skeleton className="mt-4 h-10 w-[120px]" />
            </Card>
          ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 p-6">
          <Skeleton className="h-7 w-[200px]" />
          <div className="mt-6 space-y-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full" />
              ))}
          </div>
        </Card>

        <Card className="p-6">
          <Skeleton className="h-7 w-[150px]" />
          <div className="mt-6 space-y-2">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
