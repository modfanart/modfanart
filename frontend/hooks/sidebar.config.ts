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
  BarChart3,
  Briefcase,
  Palette,
  Wallet,
  ClipboardList,
  Layers,
  FileText,
  Bot,
  UserCog,
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

type Role = 'artist' | 'brand_manager' | 'judge' | 'admin';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const sidebarConfig: Record<Role, (base: string) => NavItem[]> = {
  artist: (base: string) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'My Artworks', href: `${base}/my-artworks`, icon: Palette },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Briefcase },
    { name: 'Licensing & Earnings', href: `${base}/licensing-earnings`, icon: Wallet },
    { name: 'Portfolio', href: `#`, icon: Image },
    { name: 'Storefront', href: `#`, icon: ShoppingBag },
    { name: 'Analytics', href: `#`, icon: BarChart3 },
  ],

  brand_manager: (base: string) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'Brand Profile', href: `${base}/profile`, icon: Store },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Megaphone },
    { name: 'Submissions', href: '#', icon: ClipboardList },
    { name: 'Licensing', href: `${base}/licensing-requests`, icon: FileText },
    { name: 'Asset Hub', href: '#', icon: Layers },
    { name: 'Storefront', href: `#`, icon: ShoppingBag },
    { name: 'Content', href: `#`, icon: Newspaper },
    { name: 'Analytics', href: '#', icon: BarChart3 },
    { name: 'Automation', href: '#', icon: Bot },
    { name: 'Settings', href: `${base}/settings`, icon: Settings },
  ],

  judge: (base: string) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Trophy },
    { name: 'Review Queue', href: `${base}/review-queue`, icon: ClipboardList },
    { name: 'Results', href: `${base}/results`, icon: Trophy },
  ],

  admin: (base: string) => [
    { name: 'Overview', href: `${base}`, icon: LayoutDashboard },
    { name: 'Brands', href: `${base}/brands`, icon: Store },
    { name: 'Artists', href: `${base}/artists`, icon: Users },
    { name: 'Opportunities', href: `${base}/opportunities`, icon: Trophy },
    { name: 'Submissions', href: `${base}/submissions`, icon: ClipboardList },
    { name: 'Judging', href: `${base}/judging`, icon: FileCheck },
    { name: 'Licensing', href: `${base}/licensing`, icon: FileText },
    { name: 'Storefront', href: `#`, icon: ShoppingBag },
    { name: 'Content', href: `#`, icon: Newspaper },
    { name: 'Review Automation', href: `${base}/review-automation`, icon: Bot },
    { name: 'Team & Permissions', href: `${base}/team-permissions`, icon: UserCog },
    { name: 'Queries', icon: UserCog, href: `${base}/queries` },
  ],
};
