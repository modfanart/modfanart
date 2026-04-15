'use client';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[280px] flex flex-col justify-between">
        {/* TOP LINKS */}
        <div className="flex flex-col gap-4 mt-6">
          <Link href="/">Home</Link>
          <Link href="/for-brands">For Brands</Link>
          <Link href="/for-creators-info">For Creators</Link>
          <Link href="/for-artists">For Artists</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* AUTH BUTTONS */}
        <div className="flex flex-col gap-2 mb-6">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Log in
            </Button>
          </Link>

          <Link href="/signup">
            <Button className="w-full">Sign up</Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
