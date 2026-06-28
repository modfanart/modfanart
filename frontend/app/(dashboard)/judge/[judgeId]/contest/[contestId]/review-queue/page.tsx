import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { JudgeOpportunityContent } from '@/components/opportunities/judge-opportunity-content';
import { OpportunityPageSkeleton } from '@/components/opportunities/opportunity-page-skeleton';

export const metadata: Metadata = {
  title: 'Judge Opportunity | MOD Platform',
  description: 'Review and score contest entries',
};

type PageProps = {
  params: Promise<{
    contestId: string;
  }>;
};

export default async function JudgeOpportunityPage({ params }: PageProps) {
  const { contestId } = await params;

  if (!contestId) {
    notFound();
  }

  return (
    <Suspense fallback={<OpportunityPageSkeleton />}>
      <JudgeOpportunityContent contestId={contestId} />
    </Suspense>
  );
}
