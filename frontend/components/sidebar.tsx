'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Settings,
  Users,
  Megaphone,
  Newspaper,
  Store,
  FileCheck,
  Trophy,
  ShoppingBag,
  Image,
  Shield,
} from 'lucide-react';

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

  // ROLE-SPECIFIC BASE PATHS

  if (role === 'Artist') {
    const username = user?.username?.trim().toLowerCase();
    if (username) artistBase = `/dashboard/artist/${username}`;
  }

  if (role === 'brand_manager') {
    const brand = user?.brands?.[0];
    const brandSlug = brand?.slug;

    if (brandSlug) brandBase = `/dashboard/brand/${brandSlug}/${user?.id}`;
  }

  if (role === 'judge') {
    judgeBase = `/dashboard/judge/${user?.username}`;
  }

  if (role === 'Admin') {
    adminBase = `/dashboard/admin/${user?.role?.name}/${user?.username}`;
  }

  // SAFETY CHECK

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

  // NAVIGATION

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
            icon: Upload,
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
              icon: Store,
            },
            {
              name: 'Campaigns',
              href: `${brandBase}/contests`,
              icon: Megaphone,
            },
            {
              name: 'License Requests',
              href: `${brandBase}/license-requests`,
              icon: FileCheck,
            },
            {
              name: 'Storefront',
              href: `${brandBase}/storefront`,
              icon: ShoppingBag,
            },
            {
              name: 'Posts',
              href: `${brandBase}/posts`,
              icon: Newspaper,
            },
            {
              name: 'Settings',
              href: `${brandBase}/settings`,
              icon: Settings,
            },
          ]
        : role === 'judge'
          ? [
              {
                name: 'Dashboard',
                href: `${judgeBase}`,
                icon: LayoutDashboard,
              },
              {
                name: 'Review Submissions',
                href: `${judgeBase}/submission`,
                icon: FileCheck,
              },
              {
                name: 'Leaderboard',
                href: `${judgeBase}/leaderboard`,
                icon: Trophy,
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
                  icon: Store,
                },
                {
                  name: 'Artworks',
                  href: `${adminBase}/artworks`,
                  icon: Image,
                },
                {
                  name: 'Contests',
                  href: `${adminBase}/contests`,
                  icon: Trophy,
                },
                {
                  name: 'Roles & Permissions',
                  href: `${adminBase}/roles-permissions`,
                  icon: Shield,
                },
              ]
            : [];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:bg-card lg:text-card-foreground">
      {/* Header */}

      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        {role && <p className="mt-1 text-sm text-muted-foreground capitalize">{role} Panel</p>}
      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
