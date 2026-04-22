'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Globe, Search, User, Menu } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout?.();
    router.push('/login');
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur h-14 flex items-center">
      <div className="flex items-center w-full px-4 gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-2 min-w-[160px]">
          {/* MOBILE MENU BUTTON */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-semibold text-sm hidden sm:block">MOD Dashboard</span>
          </Link>
        </div>

        {/* CENTER SEARCH (HIDDEN ON SMALL) */}
        <div className="flex-1 hidden md:flex justify-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search artworks, users, brands..." className="pl-9 h-9 w-full" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-end min-w-[120px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {user?.username?.slice(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden sm:block font-medium">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Return to Web
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
