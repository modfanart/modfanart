'use client';

import { useRouter } from 'next/navigation';

import { userApi } from '@/app/api/userApi'; // ← adjust path

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
import { useDeleteBrandMutation } from '@/app/api/brands';

export function UserNav() {
  const router = useRouter();

  const {
    data: userData,
    isLoading,
    isError,
    error,
    isFetching,
    isUninitialized,
  } = userApi.useGetCurrentUserQuery();
  const user = userData?.user;

  // Safety: if still loading or no user → don't render (MainNav handles fallback)
  if (isLoading || !user) return null;

  const displayName = user.username || user.email?.split('@')[0] || 'User';
  const roleLabel = user.role?.name || 'Member';
  const avatarSrc = user.avatar_url || '/default-avatar.png';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium leading-none">{displayName}</p>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
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
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => router.push('/billing')}>Billing</DropdownMenuItem> */}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
