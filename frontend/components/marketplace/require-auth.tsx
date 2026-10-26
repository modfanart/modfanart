'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/AuthContext';

// Gate for buyer pages that need an account (cart, checkout, orders).
export function RequireAuth({
  children,
  message = 'Sign in to continue.',
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <LogIn className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{message}</h1>
        <Button asChild>
          <Link href={`/login?from=${encodeURIComponent(pathname || '/marketplace')}`}>Sign in</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
