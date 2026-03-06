'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Settings,
  Users,
  Sparkles,
  Star,
  Share2,
  Newspaper,
  Megaphone,
  Store,
  FileText,
  Trophy,
  FileCheck,
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
  // 🔧 Role-Specific Navigation Items — only icons changed
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
            icon: Upload, // changed: more clear for uploading artwork
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
              icon: Megaphone, // changed: better represents campaigns/promotion
            },
            {
              name: 'License Requests',
              href: `${brandBase}/license-requests`,
              icon: FileText, // changed: clearer for requests/documents
            },
            {
              name: 'Storefront',
              href: `${brandBase}/storefront`,
              icon: Store, // changed: perfect match for storefront/shop
            },
            {
              name: 'Posts',
              href: `${brandBase}/posts`,
              icon: Newspaper, // changed: more appropriate for brand posts/news
            },
            {
              name: 'Settings',
              href: `${brandBase}/settings`,
              icon: Settings,
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
                icon: Trophy, // changed: stronger visual for ranking/leaderboard
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

      {/* Subtle footer */}
      <div className="border-t px-6 py-4 text-xs text-muted-foreground/70">
        <p>© {new Date().getFullYear()} Your Platform</p>
      </div>
    </div>
  );
}
