import {
  LayoutDashboard,
  Upload,
  Settings,
  Users,
  Megaphone,
  Newspaper,
  Store,
  Trophy,
  ShoppingBag,
  Image,
  Shield,
  BarChart3,
  Briefcase,
  Palette,
  Wallet,
  ClipboardList,
  FileText,
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

type Role = 'artist' | 'brand_manager' | 'brand_owner' | 'judge' | 'seller';
type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

// All dashboards live under /dashboard (see lib/dashboard-routes.ts), so
// `base` is '/dashboard' (or '/dashboard/judging' for judge-only accounts).
// `username` is only used for links to the public profile.
type NavBuilder = (base: string, username: string) => NavItem[];

const brandNavItems: NavBuilder = (base) => [
  { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
  { name: 'Brand Profile', href: `${base}/profile`, icon: Store },
  { name: 'Opportunities', href: `${base}/opportunities`, icon: Megaphone },
  { name: 'Submissions', href: `${base}/submissions`, icon: ClipboardList },
  { name: 'Licensing', href: `${base}/licensing`, icon: FileText },
  { name: 'Store', href: `${base}/store`, icon: ShoppingBag },
  { name: 'Content', href: `${base}/content`, icon: Newspaper },
  { name: 'Settings', href: `${base}/settings`, icon: Settings },
];

export const sidebarConfig: Record<Role, NavBuilder> = {
  artist: (base, username) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'My Artworks', href: `${base}/artworks`, icon: Palette },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Briefcase },
    { name: 'Licensing & Earnings', href: `${base}/licensing`, icon: Wallet },
    { name: 'Portfolio', href: `/u/${username}`, icon: Image },
    { name: 'Store', href: `${base}/store`, icon: ShoppingBag },
    { name: 'Analytics', href: `${base}/analytics`, icon: BarChart3 },
  ],
  seller: (base, username) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'Store', href: `${base}/store`, icon: Store },
    { name: 'Products', href: `${base}/store/products`, icon: ShoppingBag },
    { name: 'Orders', href: `${base}/store/orders`, icon: ClipboardList },
    { name: 'Profile', href: `/u/${username}`, icon: Users },
  ],
  brand_manager: brandNavItems,
  brand_owner: brandNavItems,

  judge: (base) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Trophy },
  ],
};
