import { DashboardShell } from '@/components/dashboard-shell';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Overview Cards Skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-32" />
              </div>
            ))}
        </div>

        {/* Date Range Selector Skeleton */}
        <div className="flex items-center space-x-2">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-md" />
            ))}
        </div>

        {/* Chart Skeleton */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>

        {/* Top Performing Content Skeleton */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
