'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardShell } from '@/components/dashboard-shell';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error.message, error.digest ? `Digest: ${error.digest}` : '');

    // If the error is a redirect error, handle it specially
    if (error.message.includes('NEXT_REDIRECT')) {
      // This is a redirect error, let's handle it gracefully
      const redirectMatch = error.message.match(/NEXT_REDIRECT;(.+)/);
      if (redirectMatch && redirectMatch[1]) {
        router.push(redirectMatch[1]);
      } else {
        // If we can't extract the redirect URL, go to login
        router.push('/login');
      }
    }
  }, [error, router]);

  // If this is a redirect error, show a more user-friendly message
  const isRedirectError =
    error.message.includes('NEXT_REDIRECT') || error.message.includes('Redirect');

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">
        {isRedirectError ? 'Authentication Required' : 'Something went wrong!'}
      </h2>
      <p className="text-muted-foreground mb-2 text-center max-w-md">
        {isRedirectError
          ? 'You need to be logged in to access this page. Redirecting you to the login page...'
          : 'There was an error loading the dashboard. This has been logged for investigation.'}
      </p>
      {error.digest && !isRedirectError && (
        <p className="text-xs text-muted-foreground mb-6">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-4 mt-2">
        {isRedirectError ? (
          <Button onClick={() => router.push('/login')} className="mt-2">
            Go to Login
          </Button>
        ) : (
          <Button onClick={reset} className="mt-2">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
