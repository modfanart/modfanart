'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
import { useEffect } from 'react';

export function MainNav() {
  const pathname = usePathname();

  // Debug logging for navigation
  useEffect(() => {
    console.log('MainNav rendered with pathname:', pathname);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
            alt="MOD Logo"
            width={100}
            height={40}
            className="h-8 w-auto"
            priority // Helps with LCP for header logo
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {/* Home */}
            <NavigationMenuItem>
              <Link href="/" className={navigationMenuTriggerStyle()} prefetch={false}>
                Home
              </Link>
            </NavigationMenuItem>

            {/* Pricing */}
            <NavigationMenuItem>
              <Link href="/pricing" className={navigationMenuTriggerStyle()} prefetch={false}>
                Pricing
              </Link>
            </NavigationMenuItem>

            {/* Gallery Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                Gallery
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/gallery/featured"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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

            {/* Opportunities */}
            <NavigationMenuItem>
              <Link href="/opportunities" className={navigationMenuTriggerStyle()} prefetch={false}>
                Opportunities
              </Link>
            </NavigationMenuItem>

            {/* Marketplace */}
            <NavigationMenuItem>
              <Link href="/marketplace" className={navigationMenuTriggerStyle()} prefetch={false}>
                Marketplace
              </Link>
            </NavigationMenuItem>

            {/* Resources Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/resources/guidelines"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                        href="/resources/terms"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Terms and Conditions</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View submission terms and conditions
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/resources/support"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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

            {/* About Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                About
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-brands"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden md:block">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/signup" className="hidden md:block">
            <Button>Sign up</Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
