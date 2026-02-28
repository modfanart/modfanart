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
import { userApi } from '@/services/api/userApi';

// Assuming you have an auth context/store/hook that handles logout
// Option 1: Using RTK Query logout mutation (recommended if you have it)
// Option 2: Using a simple auth context with logout function
// Option 3: Manual token removal (fallback)

import { useLogoutMutation } from '@/services/api/authApi'; // ← adjust path if different
// OR if using context:
// import { useAuth } from '@/store/AuthContext';

export function UserNav() {
  const router = useRouter();

  // Option A: Using RTK Query logout mutation (cleanest if you have it)
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Option B: Using Auth Context (alternative)
  // const { logout: contextLogout, user } = useAuth();

  const { data: userData, isLoading: isUserLoading } = userApi.useGetCurrentUserQuery();

  const user = userData?.user;

  if (isUserLoading || !user) return null;

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  const roleName = (user.role?.name || 'Member').toLowerCase();
  const avatarSrc = user.avatar_url || '/default-avatar.png';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Determine dashboard path based on role
  let dashboardPath = '/dashboard';

  if (roleName === 'artist') {
    dashboardPath = user.username ? `/dashboard/artist/${user.username}` : '/dashboard/artist';
  } else if (
    roleName.includes('brand') ||
    roleName === 'brandmanager' ||
    roleName === 'brand_manager'
  ) {
    const brandName = user.profile?.['brandName'] || user.username || 'my-brand';
    dashboardPath = `/dashboard/brand/${brandName}/${user.id}`;
  }

  const isEligibleForDashboard = roleName === 'artist' || roleName.includes('brand');

  const handleLogout = async () => {
    try {
      // Preferred: Use RTK Query logout mutation (clears token, invalidates tags, etc.)
      await logout().unwrap();

      // Option B: if using context
      // await contextLogout();

      // Option C: manual (fallback / simple apps)
      // localStorage.removeItem('access_token');
      // localStorage.removeItem('refresh_token'); // if you use refresh tokens
      // document.cookie = "access_token=; Max-Age=0; path=/;";

      router.push('/login');
      // Optional: router.refresh() if you want to force re-fetch
    } catch (err) {
      console.error('Logout failed:', err);
      // You could show a toast here
      // toast.error("Logout failed. Please try again.");
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
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
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
