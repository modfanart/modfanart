'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

// Debug navigation links
const debugLinks = [
  { href: '/debug/auth', label: 'Auth Debug' },
  { href: '/debug/ai', label: 'AI Services' },
  { href: '/debug/forms', label: 'Form Tests' },
  { href: '/debug/stripe', label: 'Stripe Tests' },
];

export function DebugNav() {
  const pathname = usePathname();

  // Only render in development environment
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEBUG) {
    return null;
  }

  return (
    <div className="bg-warning-subtle border-b border-warning/30 p-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-warning-strong font-bold text-sm">DEBUG MODE</span>
            <nav className="flex items-center space-x-4">
              {debugLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-warning-strong',
                    pathname === link.href ? 'text-warning-strong underline' : 'text-warning-strong'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
