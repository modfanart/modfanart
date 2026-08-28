'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Gavel } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { sidebarConfig } from '@/hooks/sidebar.config';
import { getBasePath } from '@/hooks/getBasePath';
<<<<<<< HEAD
import {
  useGetJudgeContestsQuery,
  useGetJudgeInvitationsQuery,
} from '@/services/api/contestsApi';
=======
import { useJudgeAreaHref } from '@/hooks/use-judge-area-href';
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Judging is granted per contest through contest_judges, not through a role,
  // so it cannot come from sidebarConfig (which is keyed on user.role.name).
<<<<<<< HEAD
  // An existing user assigned as a judge keeps their original role and would
  // otherwise get no link into the judge area at all. Both queries are void-arg
  // and shared with the judge dashboard, so they cost one request per session.
  //
  // Invitations matter as much as accepted contests: redeeming the emailed
  // link does not set contest_judges.accepted, only the Accept button on the
  // judge dashboard does. Keying off accepted contests alone would hide this
  // link from exactly the people who have not found that button yet.
  const { data: judgeContests } = useGetJudgeContestsQuery(undefined, { skip: !user });
  const { data: judgeInvitations } = useGetJudgeInvitationsQuery(undefined, { skip: !user });
=======
  // The decision rules (and why pending invitations count) live in
  // lib/judging/judge-access.js, shared with the account dropdown in the site
  // header so the two surfaces cannot drift apart.
  const judgeHref = useJudgeAreaHref();
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386

  const rawRole = user?.role?.name?.toLowerCase();

  const ADMIN_ROLES = ['admin', 'super_admin', 'developer'];

  // ✅ normalize role
  const role = (
    ADMIN_ROLES.includes(rawRole || '') ? 'admin' : rawRole
  ) as keyof typeof sidebarConfig;
  const basePath = getBasePath(user);

<<<<<<< HEAD
  const judgeUsername = user?.username?.trim().toLowerCase();
  const judgesAnything =
    (judgeContests?.contests?.length ?? 0) > 0 ||
    (judgeInvitations?.contests?.length ?? 0) > 0;

  // Skipped for the JUDGE role itself, which sidebarConfig.judge already
  // points at the same place.
  const showJudging = role !== 'judge' && !!judgeUsername && judgesAnything;

=======
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  // getBasePath returns null for any role it does not know about, and for a
  // brand account with no brand attached. That used to mean no navigation at
  // all, which would strand an assigned judge whose role happens not to be one
  // of the five the sidebar understands. Judging is reachable either way.
  if (!role || !basePath) {
<<<<<<< HEAD
    if (!showJudging) {
=======
    if (!judgeHref) {
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
      return (
        <div className="flex h-full items-center justify-center p-6 text-red-500">
          Missing profile identifier
        </div>
      );
    }
  }

  const navigation = [
    ...((role && basePath && sidebarConfig[role]?.(basePath)) || []),
<<<<<<< HEAD
    ...(showJudging
      ? [{ name: 'Judging', href: `/judge/${judgeUsername}`, icon: Gavel }]
      : []),
=======
    ...(judgeHref ? [{ name: 'Judging', href: judgeHref, icon: Gavel }] : []),
>>>>>>> 8f5c3620965f1ac1ad78ff2c5adf1f4a674d1386
  ];

  return (
    <aside className="flex flex-col h-full w-72 bg-background border-r">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href !== '#' && pathname.startsWith(item.href);

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
        <Button variant="outline" className="w-full justify-start gap-2">
          Settings
        </Button>
      </div>
    </aside>
  );
}
