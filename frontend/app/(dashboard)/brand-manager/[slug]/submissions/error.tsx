'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubmissionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const isRedirectError =
      error.message?.includes('NEXT_REDIRECT') || error.message?.toLowerCase().includes('redirect');

    let timer: NodeJS.Timeout | null = null;

    if (isRedirectError) {
      console.log('Handling redirect in submissions error component');

      timer = setTimeout(() => {
        router.push('/login?callbackUrl=/submissions');
      }, 100);
    } else {
      console.error(
        'Submissions error:',
        error.message || 'Unknown error',
        error.digest ? `Digest: ${error.digest}` : ''
      );
    }

    // Cleanup: only clear timer if it was set
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, router]);

  // Determine error type for UI rendering
  const isRedirectError =
    error.message?.includes('NEXT_REDIRECT') || error.message?.toLowerCase().includes('redirect');
  const isNotFoundError =
    error.message?.includes('Not found') || error.message?.includes('NEXT_NOT_FOUND');

  // Special UI for authentication redirect errors
  if (isRedirectError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
          <AlertCircle className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          You need to be logged in to access this page. Redirecting you to the login page...
        </p>
        <Link href="/login?callbackUrl=/submissions">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  // Default error UI (including 404-style not found)
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">
        {isNotFoundError ? 'Submission Not Found' : 'Something went wrong!'}
      </h2>
      <p className="text-muted-foreground mb-2 text-center max-w-md">
        {isNotFoundError
          ? "The submission you're looking for doesn't exist or has been removed."
          : 'There was an error loading the submission. This has been logged for investigation.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-6">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-4">
        {isNotFoundError ? (
          <Link href="/submissions/manage">
            <Button>View All Submissions</Button>
          </Link>
        ) : (
          <Button onClick={reset}>Try again</Button>
        )}
      </div>
    </div>
  );
}
