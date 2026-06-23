'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Global error caught:', error);

    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
        keepalive: true,
      }).catch((e) => console.error('Failed to log error:', e));
    }
  }, [error]);

  const showTechnicalDetails = process.env.NODE_ENV !== 'production';

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-lg shadow-xl border">
          <CardHeader className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>

            <CardTitle className="text-2xl font-semibold">Something went wrong</CardTitle>

            <p className="text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred. You can try again or return to the homepage.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {showTechnicalDetails && (
              <div className="rounded-md bg-muted p-3 text-sm max-h-40 overflow-auto border">
                <p className="font-medium text-destructive">{error.message}</p>
                {error.stack && (
                  <pre className="mt-2 text-xs whitespace-pre-wrap opacity-80">{error.stack}</pre>
                )}
              </div>
            )}

            {error.digest && (
              <p className="text-xs text-center text-muted-foreground">Error ID: {error.digest}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={reset} className="flex-1 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go home
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              If this keeps happening, please contact support.
            </p>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}
