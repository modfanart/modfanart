'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Gavel } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { sidebarConfig } from '@/hooks/sidebar.config';
import { getBasePath } from '@/hooks/getBasePath';
import { useJudgeAreaHref } from '@/hooks/use-judge-area-href';
import { useActiveBrand } from '@/hooks/use-active-brand';
import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Judging is granted per contest through contest_judges, not through a role,
  // so it cannot come from sidebarConfig (which is keyed on user.role.name).
  // The decision rules (and why pending invitations count) live in
  // lib/judging/judge-access.js, shared with the account dropdown in the site
  // header so the two surfaces cannot drift apart.
  const judgeHref = useJudgeAreaHref();

  const rawRole = user?.role?.name?.toLowerCase();
  // Brand managers with several brands pick the one they're working on here
  // (it used to be part of every URL).
  const { brand: activeBrand, brands, setActiveBrand } = useActiveBrand();

  const role = rawRole as keyof typeof sidebarConfig;
  const basePath = getBasePath(user);

  // getBasePath returns null for any role it does not know about, and for a
  // brand account with no brand attached. That used to mean no navigation at
  // all, which would strand an assigned judge whose role happens not to be one
  // of the five the sidebar understands. Judging is reachable either way.
  if (!role || !basePath) {
    if (!judgeHref) {
      // BRD-05: used to print the raw debug text "Missing profile identifier".
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
          <p>Your dashboard isn't available yet.</p>
          <Link href="/dashboard" className="text-primary underline">
            Check account status
          </Link>
        </div>
      );
    }
  }

  const navigation = [
    ...((role && basePath && sidebarConfig[role]?.(basePath, user?.username ?? '')) || []).filter(
      (item) => item.href !== '#'
    ),
    ...(judgeHref ? [{ name: 'Judging', href: judgeHref, icon: Gavel }] : []),
  ];

  return (
    <aside className="flex flex-col h-full w-72 bg-background border-r">
      {brands.length > 1 && (
        <div className="border-b px-4 py-3">
          <label htmlFor="active-brand" className="mb-1 block text-xs font-medium text-muted-foreground">
            Managing brand
          </label>
          <select
            id="active-brand"
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={activeBrand?.slug ?? ''}
            onChange={(e) => setActiveBrand(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            // The first item (Overview) is the dashboard root, a prefix of every other
            // route — match it exactly or it would always look active.
            const isRoot = item.href === basePath;
            const isActive =
              item.href !== '#' && (isRoot ? pathname === item.href : pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose?.()} // 🔥 CLOSE ON MOBILE CLICK
              >
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 rounded-lg',
                    item.href === '#' && 'opacity-50 cursor-not-allowed',
                    !isActive && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        {/* AUTH-07: this Settings button had no link */}
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link href={role === 'brand_manager' || role === 'brand_owner' ? '/dashboard/settings' : '/settings'} onClick={() => onClose?.()}>
            Settings
          </Link>
        </Button>
      </div>
    </aside>
  );
}
