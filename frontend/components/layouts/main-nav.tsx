'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User, Compass, Trophy, Image as ImageIcon, Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  const isActive = (path: string) => pathname === path;

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur border-b border-border">
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

        {/* CENTER NAV */}
        <div className="hidden md:flex bg-card/80 backdrop-blur border border-border rounded-full px-3 py-1.5 shadow-sm">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {isAuthenticated ? (
                <>
                  <NavItem href="/explore" active={isActive('/explore')} icon={Compass}>
                    Explore
                  </NavItem>

                  <NavItem
                    href="/explore/contests"
                    active={isActive('/explore/contests')}
                    icon={Trophy}
                  >
                    Contests
                  </NavItem>

                  <NavItem href="/gallery" active={isActive('/gallery')} icon={ImageIcon}>
                    Gallery
                  </NavItem>

                  {/* <NavItem href="/collections" active={isActive('/collections')} icon={Layers}>
                    Collections
                  </NavItem> */}
                </>
              ) : (
                <>
                  {/* Keep typography for marketing pages */}
                  <SimpleNavItem href="/" active={isActive('/')}>
                    Home
                  </SimpleNavItem>

                  <SimpleNavItem href="/about" active={isActive('/about')}>
                    About
                  </SimpleNavItem>

                  <NavDropdown label="Guidelines">
                    <DropdownLink href="/for-brands" title="For Brands" desc="Protect IP" />
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
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <SearchModal />

          {/* {isAuthenticated && (
            <NotificationDropdown>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full bg-card border border-border hover:bg-accent"
              >
                <Bell className="h-5 w-5 text-foreground" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-[10px] flex items-center justify-center p-0 bg-primary text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </NotificationDropdown>
          )} */}

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <div className="hidden md:flex gap-2">
                <Link href="/login">
                  <button className="rounded-full w-10 h-10 flex items-center justify-center border border-border bg-card hover:bg-accent transition">
                    <User size={18} className="text-foreground" />
                  </button>
                </Link>

                <Link href="/signup">
                  <button className="rounded-full px-4 h-10 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition">
                    Sign Up
                  </button>
                </Link>
              </div>

              <div className="md:hidden">
                <MobileMenu />
              </div>
            </>
          )}
        </div>
      </header>

      {isAuthenticated && <MobileBottomNav />}
    </>
  );
}

/* ---------------- ICON NAV ITEM ---------------- */

function NavItem({ href, active, icon: Icon, children }: any) {
  return (
    <NavigationMenuItem className="flex">
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            'relative flex items-center rounded-full transition-all duration-300',
            'px-3 py-1.5',
            active
              ? 'bg-mod-lightPurple text-primary'
              : 'text-muted-foreground hover:text-primary hover:bg-accent'
          )}
        >
          {/* INNER WRAPPER (IMPORTANT) */}
          <span className="flex items-center overflow-hidden">
            {/* ICON */}
            <Icon className="h-4 w-4 shrink-0" />

            {/* TEXT */}
            <span
              className={cn(
                'ml-0 whitespace-nowrap overflow-hidden transition-all duration-300',
                active
                  ? 'max-w-[120px] opacity-100 ml-2'
                  : 'max-w-0 opacity-0 hover:max-w-[120px] hover:opacity-100 hover:ml-2'
              )}
            >
              {children}
            </span>
          </span>
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

/* ---------------- SIMPLE NAV ITEM ---------------- */

function SimpleNavItem({ href, active, children }: any) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm transition-all',
            active
              ? 'bg-mod-lightPurple text-primary font-medium'
              : 'text-muted-foreground hover:text-primary hover:bg-accent'
          )}
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

/* ---------------- DROPDOWN ---------------- */

function NavDropdown({ label, children }: any) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-primary data-[state=open]:bg-accent">
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-popover border border-border rounded-xl shadow-lg">
        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">{children}</ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DropdownLink({ href, title, desc }: any) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-3 rounded-md hover:bg-accent transition-colors">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
