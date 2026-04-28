'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Compass, Trophy, Image as ImageIcon } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { UserNav } from '../users/user-nav';
import { cn } from '@/lib/utils';

import { SearchModal } from './search-modal';
import { useAuth } from '@/store/AuthContext';

import { useGetUnreadCountQuery } from '@/services/api/notifyApi';

import { MobileMenu } from './mobile-menu';
import { MobileBottomNav } from './mobile-bottom-nav';

export function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthenticated = !!user && !loading;
  const isActive = (path: string) => pathname === path;

  useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-transparent backdrop-blur border-b border-gray-200/60">
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

        {/* CENTER NAV (COMPACT) */}
        <div className="hidden md:flex backdrop-blur border border-gray-200/60 rounded-full px-2 py-1 shadow-sm">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
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
                </>
              ) : (
                <>
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

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <div className="hidden md:flex gap-2">
                <Link href="/login">
                  <button className="rounded-full w-9 h-9 flex items-center justify-center border border-gray-200 bg-transparent hover:bg-gray-100 transition">
                    <User size={16} className="text-gray-800" />
                  </button>
                </Link>

                <Link href="/signup">
                  <button className="rounded-full px-3 h-9 text-sm font-medium bg-purple-600 text-white hover:opacity-90 transition">
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

/* ---------------- ICON NAV ITEM (COMPACT) ---------------- */

function NavItem({ href, active, icon: Icon, children }: any) {
  return (
    <NavigationMenuItem className="flex">
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            'relative flex items-center rounded-full transition-all duration-300 px-2 py-1',
            active
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />

          {/* LABEL: only visible when active */}
          <span
            className={cn(
              'ml-2 whitespace-nowrap overflow-hidden transition-all duration-300',
              active ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0'
            )}
          >
            {children}
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
            'px-2 py-1 rounded-full text-sm transition-all',
            active
              ? 'bg-purple-100 text-purple-600 font-medium'
              : 'text-gray-500 hover:text-purple-600 hover:bg-gray-100'
          )}
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

/* ---------------- DROPDOWN (REDUCED WIDTH) ---------------- */

function NavDropdown({ label, children }: any) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="rounded-full px-2 py-1 text-sm text-gray-500 hover:text-purple-600 data-[state=open]:bg-gray-100">
        {label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <ul className="grid gap-2 p-3 w-[280px] md:w-[360px] md:grid-cols-2">{children}</ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DropdownLink({ href, title, desc }: any) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href} className="block p-2 rounded-md hover:bg-gray-100 transition-colors">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <p className="text-xs text-gray-500">{desc}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
