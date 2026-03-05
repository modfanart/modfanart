'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileCheck, Share2, Settings, Users, Star, Sparkles } from 'lucide-react';

import { useAuth } from '@/store/AuthContext';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role?.name;
  let artistBase = '';
  let brandBase = '';
  let judgeBase = '';
  let adminBase = '';

  //
  // 🔥 ROLE-SPECIFIC BASE PATHS
  //
  if (role === 'Artist') {
    const username = user?.username?.trim().toLowerCase();
    if (username) artistBase = `/dashboard/artist/${username}`;
  }

  if (role === 'brand_manager') {
    // FIX: brands is an array, so use brands[0]
    const brand = user?.brands?.[0];
    const brandSlug = brand?.slug;

    if (brandSlug) brandBase = `/dashboard/brand/${brandSlug}/${user?.id}`;
  }

  if (role === 'Judge') {
    judgeBase = '/dashboard/judge';
  }

  if (role === 'Admin') {
    adminBase = '/dashboard/admin';
  }

  //
  // ❗ Missing identifier safety check
  //
  if ((role === 'Artist' && !artistBase) || (role === 'brand_manager' && !brandBase)) {
    return (
      <div className="flex h-full flex-col border-r bg-white p-6 text-red-600">
        <p>
          Missing profile identifier ({role === 'Artist' ? 'username' : 'brandSlug'}). Please
          contact support.
        </p>
      </div>
    );
  }

  //
  // 🔧 Role-Specific Navigation Items
  //
  const navigation =
    role === 'Artist'
      ? [
          {
            name: 'Dashboard',
            href: `${artistBase}`,
            icon: LayoutDashboard,
          },
          {
            name: 'Submissions',
            href: `${artistBase}/submissions`,
            icon: FileCheck,
          },
          {
            name: 'Settings',
            href: `${artistBase}/settings`,
            icon: Settings,
          },
        ]
      : role === 'brand_manager'
        ? [
            {
              name: 'Dashboard',
              href: `${brandBase}`,
              icon: LayoutDashboard,
            },
            {
              name: 'My Brand',
              href: `${brandBase}/overview`,
              icon: Star,
            },
            {
              name: 'Campaigns',
              href: `${brandBase}/contests`,
              icon: Share2,
            },
            {
              name: 'License Requests',
              href: `${brandBase}/license-requests`,
              icon: Share2,
            },
            {
              name: 'Storefront',
              href: `${brandBase}/storefront`,
              icon: Share2,
            },
            {
              name: 'Posts',
              href: `${brandBase}/posts`,
              icon: Share2,
            },
            {
              name: 'Settings',
              href: `${brandBase}/settings`,
              icon: Share2,
            },
          ]
        : role === 'Judge'
          ? [
              {
                name: 'Dashboard',
                href: `${judgeBase}`,
                icon: LayoutDashboard,
              },
              {
                name: 'Review Submissions',
                href: `${judgeBase}/reviews`,
                icon: FileCheck,
              },
              {
                name: 'Leaderboard',
                href: `${judgeBase}/leaderboard`,
                icon: Star,
              },
            ]
          : role === 'Admin'
            ? [
                {
                  name: 'Dashboard',
                  href: `${adminBase}`,
                  icon: LayoutDashboard,
                },
                {
                  name: 'Users',
                  href: `${adminBase}/users`,
                  icon: Users,
                },
                {
                  name: 'Brands',
                  href: `${adminBase}/brands`,
                  icon: Sparkles,
                },
                {
                  name: 'Settings',
                  href: `${adminBase}/settings`,
                  icon: Settings,
                },
              ]
            : [];

  return (
    <div className="flex h-full flex-col border-r bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-800">Dashboard</h2>

      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
