'use client';

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

import { useLogoutMutation } from '@/services/api/authApi';
import { useAuth } from '@/store/AuthContext';

export function UserNav() {
  const router = useRouter();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { user, loading: isUserLoading } = useAuth();

  if (isUserLoading || !user) return null;

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  const roleName = user.role?.name?.toLowerCase() ?? 'member';
  const avatarSrc = user.avatar_url || '/default-avatar.png';
  const initials = displayName.slice(0, 2).toUpperCase();

  let dashboardPath = '/';

  if (roleName === 'artist') dashboardPath = `/artist/${user.username}`;
  if (roleName === 'brand_manager') {
    const brand = user?.brands?.[0];
    if (brand?.id) dashboardPath = `/brand-manager/${brand.id}`;
  }
  if (roleName === 'judge') dashboardPath = `/judge/${user.username}`;
  if (roleName === 'admin') dashboardPath = `/admin/${user.role?.name}`;

  const isEligibleForDashboard =
    roleName === 'artist' ||
    roleName === 'brand_manager' ||
    roleName === 'judge' ||
    roleName === 'admin';

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* USER INFO */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium leading-none text-gray-900">{displayName}</p>
        <p className="text-xs text-gray-500">{user.role?.name || 'Member'}</p>
      </div>

      {/* DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
          {/* HEADER */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* LINKS */}
          <DropdownMenuGroup>
            {isEligibleForDashboard && (
              <DropdownMenuItem onClick={() => router.push(dashboardPath)}>
                Dashboard
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => router.push(`/u/${user.username || displayName}`)}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* LOGOUT */}
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
