'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  type Notification,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '@/services/api/notifyApi';

/** Where a notification leads: the artwork it is about, when it is about one. */
function hrefFor(notification: Notification) {
  const artworkId = notification.data?.['artwork_id'];
  return typeof artworkId === 'string' ? `/artwork/${artworkId}` : null;
}

/**
 * The header bell: unread count, the latest notifications, and a link to whatever each is about.
 * This is where an artist hears how screening and review of their submission went.
 */
export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  // Only the count is polled, and slowly: it sits on every dashboard page, and the API rate-limits
  // per IP. The list itself is fetched when the bell is opened.
  const { data: unread } = useGetUnreadCountQuery(undefined, { pollingInterval: 60000 });
  const { data, isLoading } = useGetNotificationsQuery(
    { limit: 8 },
    { skip: !open, refetchOnMountOrArgChange: true }
  );
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = data?.notifications ?? [];
  const unreadCount = unread?.unreadCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const href = hrefFor(notification);
                const body = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{notification.title}</span>
                      {!notification.read_at && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </>
                );
                const markRead = () => {
                  if (!notification.read_at) markAsRead(notification.id);
                };

                return href ? (
                  <Link
                    key={notification.id}
                    href={href}
                    onClick={markRead}
                    className="block p-4 transition-colors hover:bg-muted/50"
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={markRead}
                    className="block w-full p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    {body}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
