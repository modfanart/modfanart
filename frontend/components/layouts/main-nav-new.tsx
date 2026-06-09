'use client';

import { User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/store/AuthContext';
import { useGetUnreadCountQuery } from '@/services/api/notifyApi';

import { SearchModal } from './search-modal';
import { UserNav } from '../users/user-nav';
import { MobileMenu } from './mobile-menu';
import { MobileBottomNav } from './mobile-bottom-nav';

const authLinks = [
  { label: 'Explore', href: '/explore' },
  { label: 'Contests', href: '/explore/contests' },
  { label: 'Gallery', href: '/gallery' },
];

const publicLinks = [
  { label: 'Home', href: '/' },
  { label: 'For Artists', href: '/for-artists' },
  { label: 'For Brands', href: '/for-brands' },
  { label: 'About Us', href: '/about' },
  { label: 'Book Demo', href: '/contact/sales' },
];

export default function MainNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthenticated = !!user && !loading;

  useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  const links = isAuthenticated ? authLinks : publicLinks;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/867e70cb1593c54c44ee08b54da6901cb70befa1_2_dwusbj"
            alt="MOD Logo"
            width={140}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Center Nav */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-6 py-2 items-center gap-6 text-sm font-medium border border-gray-200/60">
          {links.map(({ label, href }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors hover:text-purple-500 ${
                  isActive ? 'text-purple-500 font-semibold' : 'text-gray-800'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <SearchModal />

          {loading ? (
            <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <button className="bg-white/90 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center hover:bg-white transition">
                    <User size={18} className="text-gray-800" />
                  </button>
                </Link>

                <Link href="/signup">
                  <button className="bg-purple-600 text-white rounded-full px-4 h-10 text-sm font-medium hover:opacity-90 transition">
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
      </nav>

      {isAuthenticated && <MobileBottomNav />}
    </>
  );
}
