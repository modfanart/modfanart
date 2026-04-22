'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/formatNumber';

import {
  useGetMessagesQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
} from '@/services/api/contactApi';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { Mail, Trash2, Eye, Inbox } from 'lucide-react';

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminContactPage() {
  const { data = [], isLoading } = useGetMessagesQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const [tab, setTab] = useState<'all' | 'unread' | 'read'>('all');

  const unreadMessages = data.filter((m) => m.status === 'unread');
  const readMessages = data.filter((m) => m.status === 'read');

  let messages = data;
  if (tab === 'unread') messages = unreadMessages;
  if (tab === 'read') messages = readMessages;

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Inbox className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">Manage user inquiries & support messages</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'all' ? 'default' : 'outline'} onClick={() => setTab('all')}>
          All ({data.length})
        </Button>

        <Button variant={tab === 'unread' ? 'default' : 'outline'} onClick={() => setTab('unread')}>
          Unread ({unreadMessages.length})
        </Button>

        <Button variant={tab === 'read' ? 'default' : 'outline'} onClick={() => setTab('read')}>
          Read ({readMessages.length})
        </Button>
      </div>

      {/* TABLE */}
      <MessagesTable messages={messages} markAsRead={markAsRead} deleteMessage={deleteMessage} />
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function MessagesTable({
  messages,
  markAsRead,
  deleteMessage,
}: {
  messages: any[];
  markAsRead: any;
  deleteMessage: any;
}) {
  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Subject</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {messages.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="py-16 text-center">
                  <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  No messages found
                </div>
              </td>
            </tr>
          ) : (
            messages.map((msg) => (
              <tr key={msg.id} className="border-t hover:bg-muted/40">
                {/* USER */}
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">{msg.name}</div>
                    <div className="text-xs text-muted-foreground">{msg.email}</div>
                  </div>
                </td>

                {/* SUBJECT */}
                <td className="px-4 py-3">
                  <div className="font-medium">{msg.subject}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{msg.message}</div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      msg.status === 'unread'
                        ? 'destructive'
                        : msg.status === 'read'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {msg.status}
                  </Badge>
                </td>

                {/* DATE */}
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(msg.created_at).toLocaleDateString()}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {/* MARK AS READ */}
                    {msg.status === 'unread' && (
                      <Button size="icon" variant="ghost" onClick={() => markAsRead(msg.id)}>
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}

                    {/* DELETE */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (!confirm('Delete this message?')) return;
                        deleteMessage(msg.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
