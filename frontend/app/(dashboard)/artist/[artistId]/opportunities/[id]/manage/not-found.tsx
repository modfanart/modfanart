import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { DashboardShell } from '@/components/dashboard-shell';

export default function OpportunityNotFound() {
  return (
    <EmptyState
      title="Opportunity Not Found"
      description="The opportunity you're looking for doesn't exist or you don't have access to it."
      icon="file-question" // You can replace this with a proper icon component if needed
      actionLabel="Back to Opportunities"
      actionLink="/dashboard/opportunities"
    />
  );
}
