import { Suspense } from 'react';
import { JudgeResultsContent } from '@/components/opportunities/judge-results-content';

// The previous version of this route lived in a folder literally named
// "contestId" rather than "[contestId]", so it was a static segment. The only
// link to it points at `${base}/results/${contest.id}`, which matched no route
// and 404'd, and params.contestId was always undefined.
export default async function JudgeResultsPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = await params;

  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading standings...</div>}>
      <JudgeResultsContent contestId={contestId} />
    </Suspense>
  );
}
