'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuGroup,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/store/AuthContext';
import { useJudgeAreaHref } from '@/hooks/use-judge-area-href';
import { formatRoleLabel } from '@/lib/role-label';

export function UserNav() {
const router = useRouter();

const { user, loading: isUserLoading, logout } = useAuth();
const [isLoggingOut, setIsLoggingOut] = useState(false);

// Judging rights are per-contest (contest_judges), not per-role, so this
// cannot ride on isEligibleForDashboard below: a fan-role judge has no
// dashboard at all, and this dropdown is their only way into the judge area
// from the public site. Called before the early return to keep hook order
// stable.
const judgeHref = useJudgeAreaHref();

if (isUserLoading || !user) return null;

const displayName = user.username || user.email?.split('@')[0] || 'User';
const avatarSrc = user.avatar_url || '/default-avatar.png';
const initials = displayName.slice(0, 2).toUpperCase();

const roleName = user.role?.name?.toLowerCase() ?? 'member';

let dashboardPath = '/';

switch (roleName) {
  case 'artist':
    dashboardPath = `/dashboard`;
    break;

  case 'brand_manager':
  case 'brand_owner': {
    // BRD-02: an unverified brand account has no brand yet. /brand-manager
    // is now a real landing page that shows verification status, or
    // forwards to /brand-manager/<slug> once a brand exists.
    const brand = user?.brands?.[0];
    dashboardPath = '/dashboard'; // shows verification status when no brand yet
    break;
  }

  case 'judge':
    dashboardPath = `/dashboard/judging`;
    break;

  case 'seller':
    dashboardPath = `/dashboard`;
    break;

  default:
    dashboardPath = '/';
}

// Admin tooling lives in a separate app, not in this frontend.
const isEligibleForDashboard = ['artist', 'brand_manager', 'brand_owner', 'judge', 'seller'].includes(
  roleName
);

const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await logout();
  } catch (err) {
    console.error('Logout failed:', err);
  } finally {
    setIsLoggingOut(false);
  }
};

return (
  <div className="flex items-center gap-3">
    {/* Own backdrop: the nav is transparent and overlays dark hero images on
        several routes, so contrast cannot depend on the page behind it. */}
    <div className="hidden md:block text-right bg-background/90 backdrop-blur rounded-full px-4 py-1.5 border border-border/60">
      <p className="text-sm font-medium leading-none text-foreground">
        {displayName}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatRoleLabel(user.role?.name)}
      </p>
    </div>


  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full"
        aria-label="Account menu"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      className="w-56 bg-background backdrop-blur-xl border border-border rounded-xl shadow-lg"
      align="end"
      forceMount
    >
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {isEligibleForDashboard && (
          <DropdownMenuItem
            onClick={() => router.push(dashboardPath)}
          >
            Dashboard
          </DropdownMenuItem>
        )}

        {judgeHref && (
          <DropdownMenuItem
            onClick={() => router.push(judgeHref)}
          >
            Judging
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => router.push('/marketplace/orders')}>
          My orders
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() =>
            router.push(`/u/${user.username || displayName}`)
          }
        >
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
        >
          Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="text-destructive focus:bg-destructive-subtle focus:text-destructive"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>


);
}
