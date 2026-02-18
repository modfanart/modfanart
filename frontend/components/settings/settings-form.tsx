'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';

// Import sections
import AccountSection from './AccountSection';
import ApiSection from './ApiSection';
import BillingSection from './BillingsSection';
import NotificationsSection from './NotificationsSection';
import ProfileSection from './ProfileSection';
import SecuritySection from './SecuritySection';

const MENU_ITEMS = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
  { id: 'api', label: 'API' },
] as const;

type TabId = (typeof MENU_ITEMS)[number]['id'];

export default function SettingsForm() {
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
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-6 border rounded-lg bg-card p-4 shadow-sm">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'flex items-center justify-start whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    currentTab === item.id
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'min-w-[100px] md:min-w-0'
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
            <h1 className="text-3xl font-bold capitalize tracking-tight">{currentTab}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your {currentTab.toLowerCase()} settings
            </p>
          </header>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
