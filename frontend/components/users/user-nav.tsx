'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

import { Sun, Moon } from 'lucide-react';

export function UserNav() {
  const router = useRouter();

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { user, loading: isUserLoading } = useAuth();

  // 🌙 DARK MODE STATE
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'dark' || (!stored && systemDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }

    setIsDark(!isDark);
  };

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
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium leading-none">{displayName}</p>
        <p className="text-xs text-muted-foreground">{user.role?.name || 'Member'}</p>
      </div>

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
          className="w-56 bg-card/80 backdrop-blur-xl border border-border"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
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

          {/* 🌙 DARK MODE TOGGLE */}
          {/* <DropdownMenuItem onClick={toggleTheme} className="flex items-center justify-between">
            <span>Theme</span>
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator /> */}

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
