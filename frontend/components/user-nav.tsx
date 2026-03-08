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

  // Dashboard Path
  let dashboardPath = '/dashboard';

  if (roleName === 'artist') {
    dashboardPath = `/dashboard/artist/${user.username}`;
  }

  if (roleName === 'brand_manager') {
    const brand = user?.brands?.[0];
    const slug = brand?.slug;

    if (slug) {
      dashboardPath = `/dashboard/brand/${slug}/${user.id}`;
    }
  }

  if (roleName === 'judge') {
    dashboardPath = `/dashboard/judge/${user.username}`;
  }

  const isEligibleForDashboard =
    roleName === 'artist' || roleName === 'brand_manager' || roleName === 'judge';

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
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium leading-none">{displayName}</p>
        <p className="text-xs text-muted-foreground">{user.role?.name || 'Member'}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full" disabled={isLoggingOut}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

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

          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
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
