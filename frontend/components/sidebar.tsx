'use client';

import {
  LayoutDashboard,
  Upload,
  FileCheck,
  Trophy,
  DollarSign,
  BarChart3,
  History,
  Briefcase,
  Users,
  CreditCard,
  Activity,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useAuth } from '@/store/AuthContext';

interface SidebarProps {
  className?: string;
}

type Route = {
  label: string;
  icon: React.ReactNode;
  href: string;
  active: (pathname: string) => boolean;
  testId?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Loading / missing data state
  if (loading || !user?.role?.name || !user?.username) {
    return (
      <div className="flex h-full flex-col border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <div className="h-8 w-20 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const role = user.role.name;
  const username = user.username.trim().toLowerCase(); // normalize username

  // Base paths using username
  const artistBase = `/dashboard/artist/${username}`;
  const brandBase = `/dashboard/brand/${username}`;

  // ── Artist routes ─────────────────────────────────────────────────────
  const artistRoutes: Route[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: `${artistBase}/dashboard`,
      active: (p) => p === `${artistBase}/dashboard` || p === `${artistBase}`,
    },
    {
      label: 'My Submissions',
      icon: <Upload className="h-5 w-5" />,
      href: `${artistBase}/submissions/manage`,
      active: (p) => p.startsWith(`${artistBase}/submissions`),
    },
    {
      label: 'License Requests',
      icon: <FileCheck className="h-5 w-5" />,
      href: `${artistBase}/license-requests`,
      active: (p) => p.startsWith(`${artistBase}/license-requests`),
    },
    // {
    //   label: 'Contests',
    //   icon: <Trophy className="h-5 w-5" />,
    //   href: `${artistBase}/contests`,
    //   active: (p) => p.startsWith(`${artistBase}/contests`),
    // },
    // {
    //   label: 'Earnings',
    //   icon: <DollarSign className="h-5 w-5" />,
    //   href: `${artistBase}/earnings`,
    //   active: (p) => p === `${artistBase}/earnings`,
    // },
    // {
    //   label: 'Analytics',
    //   icon: <BarChart3 className="h-5 w-5" />,
    //   href: `${artistBase}/analytics`,
    //   active: (p) => p.startsWith(`${artistBase}/analytics`),
    // },
    // {
    //   label: 'History',
    //   icon: <History className="h-5 w-5" />,
    //   href: `${artistBase}/history`,
    //   active: (p) => p === `${artistBase}/history`,
    // },
  ];

  // ── Brand Manager routes ──────────────────────────────────────────────
  const brandManagerRoutes: Route[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: `${brandBase}/dashboard`,
      active: (p) => p === `${brandBase}/dashboard` || p === brandBase,
    },
    {
      label: 'My Brands',
      icon: <Briefcase className="h-5 w-5" />,
      href: `${brandBase}/manage`,
      active: (p) => p.startsWith(`${brandBase}/manage`),
    },
    {
      label: 'License Overview',
      icon: <FileCheck className="h-5 w-5" />,
      href: `${brandBase}/licenses`,
      active: (p) => p.startsWith(`${brandBase}/licenses`),
    },
    {
      label: 'Artists & Collaborations',
      icon: <Users className="h-5 w-5" />,
      href: `${brandBase}/artists`,
      active: (p) => p.startsWith(`${brandBase}/artists`),
    },
    {
      label: 'Payouts',
      icon: <CreditCard className="h-5 w-5" />,
      href: `${brandBase}/payouts`,
      active: (p) => p === `${brandBase}/payouts`,
    },
    {
      label: 'Performance',
      icon: <Activity className="h-5 w-5" />,
      href: `${brandBase}/analytics`,
      active: (p) => p.startsWith(`${brandBase}/analytics`),
    },
  ];

  const currentRoutes = role === 'BrandManager' ? brandManagerRoutes : artistRoutes;
  const sectionTitle = role === 'BrandManager' ? 'BRAND TOOLS' : 'ARTIST MENU';

  return (
    <div className={cn('flex h-full flex-col border-r bg-white', className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
            alt="MOD Logo"
            width={80}
            height={30}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-gray-500">
            {sectionTitle}
          </h2>

          <nav className="space-y-1">
            {currentRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                prefetch
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  route.active(pathname)
                    ? 'bg-[#9747ff] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
                data-testid={route.testId}
              >
                {route.icon}
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Settings – common for everyone */}
        {/* <div className="px-3 py-2 mt-4 border-t">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-tight text-gray-500">
            SUPPORT
          </h2>
          <nav className="space-y-1">
            <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname.startsWith('/settings')
                  ? 'bg-[#9747ff] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
              prefetch
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div> */}
      </div>
    </div>
  );
}
