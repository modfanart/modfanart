'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/store/AuthContext';
import { sidebarConfig } from '@/hooks/sidebar.config';
import { getBasePath } from '@/hooks/getBasePath';
import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role?.name?.toLowerCase() as keyof typeof sidebarConfig;
  const basePath = getBasePath(user);

  if (!role || !basePath) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-red-500">
        Missing profile identifier
      </div>
    );
  }

  const navigation = sidebarConfig[role]?.(basePath) || [];

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r bg-background">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href !== '#' && pathname.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 rounded-lg',
                    item.href === '#' && 'opacity-50 cursor-not-allowed',
                    !isActive && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          Settings
        </Button>
      </div>
    </aside>
  );
}
