import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ManageOpportunityContent } from '@/components/opportunities/manage-opportunity-content';
import { DashboardShell } from '@/components/dashboard-shell';
import { OpportunityPageSkeleton } from '@/components/opportunities/opportunity-page-skeleton';

export const metadata: Metadata = {
  title: 'Manage Opportunity | MOD Platform',
  description: 'Manage opportunity details and submissions',
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ManageOpportunityPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <DashboardShell>
      <Suspense fallback={<OpportunityPageSkeleton />}>
        <ManageOpportunityContent opportunityId={id} />
      </Suspense>
    </DashboardShell>
  );
}
