'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDebug() {
  // Only render in development environment
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEBUG) {
    return null;
  }

  const { data: session, status } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>Current authentication state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Status: {status}</h3>
            {session ? (
              <div className="mt-2">
                <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            )}
          </div>
          <div className="flex space-x-2">
            {!session ? (
              <Button onClick={() => signIn()}>Sign In</Button>
            ) : (
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
