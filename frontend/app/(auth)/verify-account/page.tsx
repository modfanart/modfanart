import { Suspense } from 'react';
import VerifyEmailContent from '@/components/users/verify-account-content';
export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
