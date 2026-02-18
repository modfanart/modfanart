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
    <div className="bg-yellow-100 border-b border-yellow-300 p-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-800 font-bold text-sm">DEBUG MODE</span>
            <nav className="flex items-center space-x-4">
              {debugLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-yellow-900',
                    pathname === link.href ? 'text-yellow-900 underline' : 'text-yellow-700'
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
