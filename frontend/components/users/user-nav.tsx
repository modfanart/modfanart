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

export function UserNav() {
const router = useRouter();

const { user, loading: isUserLoading, logout } = useAuth();
const [isLoggingOut, setIsLoggingOut] = useState(false);

if (isUserLoading || !user) return null;

const displayName = user.username || user.email?.split('@')[0] || 'User';
const avatarSrc = user.avatar_url || '/default-avatar.png';
const initials = displayName.slice(0, 2).toUpperCase();

const roleName = user.role?.name?.toLowerCase() ?? 'member';

const ADMIN_ROLES = ['admin', 'superadmin', 'developer'];

let dashboardPath = '/';

switch (roleName) {
case 'artist':
dashboardPath = `/artist/${user.username}`;
break;


case 'brand_manager':
case 'brand_owner': {
  const brand = user?.brands?.[0];

  if (brand?.slug) {
    dashboardPath = `/brand-manager/${brand.slug}`;
  } else {
    dashboardPath = '/brand-manager';
  }

  break;
}

case 'judge':
  dashboardPath = `/judge/${user.username}`;
  break;

case 'admin':
case 'superadmin':
case 'developer':
  dashboardPath = `/admin/${user.username}`;
  break;

default:
  dashboardPath = '/';


}

const isEligibleForDashboard = [
'artist',
'brand_manager',
'brand_owner',
'judge',
'admin',
'superadmin',
'developer',
].includes(roleName);

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
    <div className="hidden md:block text-right bg-white/90 backdrop-blur rounded-full px-4 py-1.5 border border-gray-200/60">
      <p className="text-sm font-medium leading-none text-gray-900">
        {displayName}
      </p>
      <p className="text-xs text-gray-500">
        {user.role?.name || 'Member'}
      </p>
    </div>


  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      className="w-56 bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg"
      align="end"
      forceMount
    >
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {displayName}
          </p>
          <p className="text-xs text-gray-500">
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
        className="text-red-600 focus:bg-red-50 focus:text-red-600"
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
