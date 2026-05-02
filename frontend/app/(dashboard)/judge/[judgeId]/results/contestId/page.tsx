import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { JudgeResultsContent } from '@/components/opportunities/judge-results-content';
export default async function JudgeResultsPage({ params }: any) {
  const { contestId } = params;

  if (!contestId) notFound();

  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <JudgeResultsContent contestId={contestId} />
    </Suspense>
  );
}
