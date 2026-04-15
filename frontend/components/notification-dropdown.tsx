'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '@/services/api/notifyApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useGetNotificationsQuery({ limit: 8 });
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.notifications ?? [];

  return (
    <div className="relative group">
      {children}

      {/* Dropdown Content */}
      <div className="absolute right-0 top-12 hidden w-80 group-hover:block z-50">
        <div className="bg-popover border rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
              >
                Mark all read
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{notif.title}</div>
                    {notif.body && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.body}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t">
            <Link href="/notifications" className="block">
              <Button variant="outline" className="w-full text-sm">
                View All Notifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}