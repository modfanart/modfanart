'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Gavel, Settings, Store } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { sidebarConfig } from '@/hooks/sidebar.config';
import { getBasePath } from '@/hooks/getBasePath';
import { useJudgeAreaHref } from '@/hooks/use-judge-area-href';
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

  const ADMIN_ROLES = ['admin', 'super_admin', 'developer'];

  // ✅ normalize role
  const role = (
    ADMIN_ROLES.includes(rawRole || '') ? 'admin' : rawRole
  ) as keyof typeof sidebarConfig;
  const basePath = getBasePath(user);

  // getBasePath returns null for any role it does not know about, and for a
  // brand account with no brand attached. That used to mean no navigation at
  // all, which would strand an assigned judge whose role happens not to be one
  // of the five the sidebar understands. Judging is reachable either way.
  // A brand account with no brand yet (verification pending) still needs a way back to
  // /brand-manager, which shows the application status.
  const isBrandRole = ['brand_manager', 'brand_owner', 'brand_editor', 'brand_member'].includes(
    rawRole || ''
  );
  const brandSetupNav =
    isBrandRole && !basePath ? [{ name: 'Brand setup', href: '/brand-manager', icon: Store }] : [];

  if (!role || !basePath) {
    if (!judgeHref && brandSetupNav.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-red-500">
          Missing profile identifier
        </div>
      );
    }
  }

  const navigation = [
    ...brandSetupNav,
    ...((role && basePath && sidebarConfig[role]?.(basePath)) || []),
    ...(judgeHref ? [{ name: 'Judging', href: judgeHref, icon: Gavel }] : []),
  ];

  return (
    <aside className="flex flex-col h-full w-72 bg-background border-r">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            // Overview's href is the dashboard root, a prefix of every other item, so it
            // only counts as active on an exact match (otherwise two items light up).
            const isActive =
              item.href !== '#' &&
              (item.href === basePath
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`));

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
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link href="/settings" onClick={() => onClose?.()}>
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </aside>
  );
}
