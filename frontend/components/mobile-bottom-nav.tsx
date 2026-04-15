'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Image, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/explore', icon: Home, label: 'Explore' },
  { href: '/explore/contests', icon: Trophy, label: 'Contests' },
  { href: '/gallery/featured', icon: Image, label: 'Gallery' },
  { href: '/collections', icon: Layers, label: 'Collections' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center text-xs',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
