'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { isAdminRole } from '@/lib/marketplace/roles';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Moderation', path: '/moderation' },
  { label: 'Sellers', path: '/sellers' },
  { label: 'Orders', path: '/orders' },
  { label: 'Payouts', path: '/payouts' },
];

export function AdminShell({
  basePath,
  title,
  children,
}: {
  basePath: string;
  title: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const root = `${basePath}/marketplace`;

  if (loading) return <p className="p-8 text-muted-foreground">Loading…</p>;

  if (!isAdminRole(user?.role?.name)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Admin access required</h1>
        <p className="text-sm text-muted-foreground">Your account can&apos;t manage the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <ShieldCheck className="h-6 w-6" /> {title}
      </h1>

      <nav className="flex gap-1 overflow-x-auto border-b" aria-label="Marketplace admin sections">
        {TABS.map((t) => {
          const href = `${root}${t.path}`;
          const active = t.path === '' ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={t.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
