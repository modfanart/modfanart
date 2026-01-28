'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

// ────────────────────────────────────────────────
// Use the correct api slice (authApi or userApi)
// Make sure this import points to where getCurrentUser is defined
// ────────────────────────────────────────────────
import { authApi } from '@/app/api/authApi'; // ← adjust path if needed
import userApi from '@/app/api/userApi';
// or: import { userApi } from '@/app/api/userApi';

export function MainNav() {
  const pathname = usePathname();

  // Fetch current user – should now return the full user object you showed
  const {
    data: queryUser,
    isLoading,
    isFetching,
    error,
  } = userApi.useGetCurrentUserQuery(undefined, {
    // Optional: skip query if we know user is not logged in (optimization)
    // skip: typeof window !== 'undefined' && !localStorage.getItem('accessToken'),

    // Optional: refetch when window regains focus
    refetchOnFocus: true,

    // Optional: refetch every 10 minutes
    // pollingInterval: 10 * 60 * 1000,
  });
  console.log(queryUser);
  // For debugging – remove in production
  useEffect(() => {
    console.log('MainNav → Current user query:', {
      user: queryUser,
      isLoading,
      isFetching,
      error: error ? (error as any)?.data?.message || error : null,
      pathname,
    });
  }, [queryUser, isLoading, isFetching, error, pathname]);

  // We consider user authenticated only when we have real data
  const isAuthenticated = !!queryUser && !isLoading && !isFetching;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
            alt="MOD Logo"
            width={140}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex mx-auto">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <Link href="/" passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={pathname === '/'}
                >
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={pathname === '/pricing'}
                >
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Gallery</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/gallery/featured"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Featured Artwork</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse our curated collection of licensed fan art
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/gallery/available"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">
                          Available for Licensing
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Discover fan art available for commercial licensing
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/opportunities" legacyBehavior passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={pathname === '/opportunities'}
                >
                  Opportunities
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/marketplace" legacyBehavior passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  active={pathname === '/marketplace'}
                >
                  Marketplace
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/resources/guidelines"
                        className="block select-none space-y-1 rounded-md p-3 ..."
                      >
                        <div className="text-sm font-medium leading-none">Brand Guidelines</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View IP requirements and submission standards
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/resources/support"
                        className="block select-none space-y-1 rounded-md p-3 ..."
                      >
                        <div className="text-sm font-medium leading-none">Support</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Get help with submissions and licensing
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>About</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-brands"
                        className="block select-none space-y-1 rounded-md p-3 ..."
                      >
                        <div className="text-sm font-medium leading-none">For Brands</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Learn how brands can protect IP and monetize fan art
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-creators-info"
                        className="block select-none space-y-1 rounded-md p-3 ..."
                      >
                        <div className="text-sm font-medium leading-none">For Creators</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          See how content creators can engage fans and earn royalties
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-artists"
                        className="block select-none space-y-1 rounded-md p-3 ..."
                      >
                        <div className="text-sm font-medium leading-none">For Artists</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Discover how artists can license their fan art
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side – Auth / User area */}
        <div className="flex items-center gap-4">
          {isLoading || isFetching ? (
            <div className="h-9 w-24 animate-pulse rounded bg-muted/60" />
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
