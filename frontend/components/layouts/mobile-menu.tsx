'use client';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type NavLink = { label: string; href: string };

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'For Artists', href: '/for-artists' },
  { label: 'For Brands', href: '/for-brands' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function MobileMenu({ links = DEFAULT_LINKS }: { links?: NavLink[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-full bg-background/90 backdrop-blur"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[280px] flex flex-col justify-between">
        <SheetTitle className="sr-only">Main menu</SheetTitle>
        <nav className="flex flex-col gap-4 mt-6" aria-label="Main">
          {links.map(({ label, href }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 mb-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
