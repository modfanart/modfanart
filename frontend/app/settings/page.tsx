// app/settings/page.tsx
'use client';
import type { Metadata } from 'next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';

// Import your section components
import AccountSection from '@/components/settings/AccountSection';
import ApiSection from '@/components/settings/ApiSection';
import BillingSection from '@/components/settings/BillingsSection';
import NotificationsSection from '@/components/settings/NotificationsSection';
import ProfileSection from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';

const MENU_ITEMS = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
  { id: 'api', label: 'API' },
] as const;

type TabId = (typeof MENU_ITEMS)[number]['id'];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get('tab') || 'profile') as TabId;

  const setTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'profile') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'profile':
        return <ProfileSection />;
      case 'account':
        return <AccountSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      case 'billing':
        return <BillingSection />;
      case 'api':
        return <ApiSection />;
      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Invalid section</p>
            <p>Please select an option from the menu.</p>
          </div>
        );
    }
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0">
            <div className="sticky top-6 border rounded-xl bg-card/80 backdrop-blur-sm p-4 shadow-sm">
              <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-3 md:pb-0">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'flex items-center justify-start whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                      currentTab === item.id
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-8">
            <header>
              <h1 className="text-3xl font-bold tracking-tight capitalize">{currentTab}</h1>
              <p className="text-muted-foreground mt-1.5">
                Manage your {currentTab.toLowerCase()} settings and preferences.
              </p>
            </header>

            <div className="rounded-xl border bg-card p-6 shadow-sm">{renderContent()}</div>
          </main>
        </div>
      </div>
    </LayoutWrapper>
  );
}
