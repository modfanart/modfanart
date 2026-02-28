import { DashboardShell } from '@/components/dashboard-shell';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="divide-y divide-border rounded-md border">
          <div className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
