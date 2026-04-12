'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

import { UserNav } from '@/components/user-nav';
import { cn } from '@/lib/utils';

import { SearchModal } from './search-modal';
import { useAuth } from '@/store/AuthContext';

export function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthenticated = !!user && !loading;

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
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

        {/* NAV */}
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

                <NavItem href="/gallery/featured" active={pathname === '/gallery/featured'}>
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
                  <DropdownLink
                    href="/for-brands"
                    title="For Brands"
                    desc="Protect IP and monetize fan art"
                  />
                  <DropdownLink
                    href="/for-creators-info"
                    title="For Creators"
                    desc="Engage fans and earn royalties"
                  />
                  <DropdownLink
                    href="/for-artists"
                    title="For Artists"
                    desc="License your fan art"
                  />
                </NavDropdown>

                <NavDropdown label="Contact">
                  <DropdownLink
                    href="/contact"
                    title="Contact"
                    desc="General inquiries and support"
                  />
                  <DropdownLink
                    href="/contact/sales"
                    title="Contact Sales"
                    desc="Brand partnerships"
                  />
                </NavDropdown>

                <NavDropdown label="Resources">
                  <DropdownLink
                    href="/resources/guidelines"
                    title="Brand Guidelines"
                    desc="Submission standards"
                  />
                  <DropdownLink
                    href="/resources/support"
                    title="Support"
                    desc="Help & documentation"
                  />
                </NavDropdown>

                <NavDropdown label="Legal" cols={2}>
                  <DropdownLink href="/legal/terms-and-service" title="Terms" desc="User terms" />
                  <DropdownLink href="/legal/privacy-policy" title="Privacy" desc="Data handling" />
                </NavDropdown>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <SearchModal />

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>

              <Link href="/signup" className="hidden md:block">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------- Helpers ---------------- */

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(navigationMenuTriggerStyle(), active && 'bg-accent text-accent-foreground')}
        >
          {children}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function NavDropdown({
  label,
  children,
  cols = 2,
}: {
  label: string;
  children: React.ReactNode;
  cols?: number;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul
          className={cn(
            'grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px]',
            cols === 2 && 'md:grid-cols-2'
          )}
        >
          {children}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function DropdownLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block space-y-1 rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
