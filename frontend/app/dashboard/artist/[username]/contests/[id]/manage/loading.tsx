import { OpportunityPageSkeleton } from '@/components/opportunities/opportunity-page-skeleton';
import { DashboardShell } from '@/components/dashboard-shell';

export default function ManageOpportunityLoading() {
  return (
    <DashboardShell>
      <OpportunityPageSkeleton />
    </DashboardShell>
  );
}
