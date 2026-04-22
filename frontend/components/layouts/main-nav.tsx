'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { UserNav } from '../users/user-nav';
import { cn } from '@/lib/utils';

import { SearchModal } from './search-modal';
import { useAuth } from '@/store/AuthContext';

import { useGetUnreadCountQuery } from '@/services/api/notifyApi';
import { NotificationDropdown } from './notification-dropdown';

import { MobileMenu } from './mobile-menu';
import { MobileBottomNav } from './mobile-bottom-nav';

export function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthenticated = !!user && !loading;
  const isActive = (path: string) => pathname.startsWith(path);

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/mod-logo-dark.png"
              alt="MOD Logo"
              width={140}
              height={44}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* DESKTOP NAV */}
          <NavigationMenu className="hidden md:flex mx-auto">
            <NavigationMenuList className="gap-1">
              {isAuthenticated ? (
                <>
                  <NavItem href="/explore" active={isActive('/explore')}>
                    Explore
                  </NavItem>

                  <NavItem href="/explore/contests" active={pathname === '/explore/contests'}>
                    Contests
                  </NavItem>

                  <NavItem href="/gallery/" active={pathname === '/gallery/'}>
                    Gallery
                  </NavItem>

                  <NavItem href="/collections" active={isActive('/collections')}>
                    Collections
                  </NavItem>
                </>
              ) : (
                <>
                  <NavItem href="/" active={pathname === '/'}>
                    Home
                  </NavItem>

                  <NavDropdown label="About">
                    <DropdownLink href="/for-brands" title="For Brands" desc="Protect IP" />
                    <DropdownLink
                      href="/for-creators-info"
                      title="For Creators"
                      desc="Earn royalties"
                    />
                    <DropdownLink href="/for-artists" title="For Artists" desc="License art" />
                  </NavDropdown>

                  <NavDropdown label="Contact">
                    <DropdownLink href="/contact" title="Contact" desc="Support" />
                    <DropdownLink href="/contact/sales" title="Sales" desc="Partnerships" />
                  </NavDropdown>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <SearchModal />

            {isAuthenticated && (
              <NotificationDropdown>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center p-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </NotificationDropdown>
            )}

            {/* MOBILE LOGIC */}
            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated ? (
              <UserNav />
            ) : (
              <>
                {/* Desktop buttons */}
                <div className="hidden md:flex gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </div>

                {/* Mobile hamburger */}
                <div className="md:hidden">
                  <MobileMenu />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV (AUTH ONLY) */}
      {isAuthenticated && <MobileBottomNav />}
    </>
  );
}

/* ---------------- Helpers ---------------- */

function NavItem({ href, active, children }: any) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link href={href} className={cn(navigationMenuTriggerStyle(), active && 'bg-accent')}>
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function NavDropdown({ label, children }: any) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">{children}</ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DropdownLink({ href, title, desc }: any) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-3 hover:bg-accent rounded-md">
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
