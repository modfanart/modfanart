import { Suspense } from 'react';

import NewSubmission from '@/components/submissions/new-submission';

export default function NewSubmissionPage() {
  return (
    <Suspense fallback={null}>
      <NewSubmission />
    </Suspense>
  );
}
