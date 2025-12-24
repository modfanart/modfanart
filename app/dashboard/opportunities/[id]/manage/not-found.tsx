import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { DashboardShell } from '@/components/dashboard-shell';

export default function OpportunityNotFound() {
  return (
    <DashboardShell>
      <EmptyState
        title="Opportunity Not Found"
        description="The opportunity you're looking for doesn't exist or you don't have access to it."
        icon="file-question"
        action={
          <Button asChild>
            <Link href="/dashboard/opportunities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Link>
          </Button>
        }
      />
    </DashboardShell>
  );
}
