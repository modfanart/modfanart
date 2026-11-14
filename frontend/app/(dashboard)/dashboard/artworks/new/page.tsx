import { Suspense } from 'react';

import NewSubmission from '@/components/submissions/new-submission';

// This page used to be a stale 680-line copy of components/submissions/
// new-submission.tsx: it missed the slug->UUID fix (ART-05), the contest
// picker (ART-04) and redirected to "//artist/<name>/my-artworks" (a
// protocol-relative URL that leaves the site). Both routes now share one
// implementation.
export default function ArtistNewSubmissionPage() {
  return (
    <Suspense fallback={null}>
      <NewSubmission />
    </Suspense>
  );
}
