'use client';

import React, { useState } from 'react';
import { Eye, Trash } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

import {
  useGetMessagesQuery,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
} from '@/services/api/contactApi';

import { toast } from 'sonner';

export const QueriesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  // ✅ RTK Query hooks
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useGetMessagesQuery();

  const [markAsRead] = useMarkAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // View message
  const handleView = async (message) => {
    setSelectedMessage(message);

    if (!message.is_read) {
      try {
        await markAsRead(message.id).unwrap();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete message
  const handleDelete = async (id) => {
    try {
      await deleteMessage(id).unwrap();
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Customer Queries"
        subtitle={`${messages.length} messages`}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-400">Failed to load messages</p>
              <Button onClick={refetch} className="mt-4">
                Retry
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-zinc-400">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id}>
                      <td className="text-white">{msg.name}</td>
                      <td className="text-zinc-400">{msg.email}</td>
                      <td className="truncate max-w-xs">
                        {msg.message}
                      </td>
                      <td className="text-sm text-zinc-500">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            msg.is_read
                              ? 'bg-green-900 text-green-400'
                              : 'bg-yellow-900 text-yellow-400'
                          }`}
                        >
                          {msg.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>

                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(msg)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🔍 Message Detail Modal */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Message Details
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500">Name</p>
                <p className="text-white">{selectedMessage.name}</p>
              </div>

              <div>
                <p className="text-zinc-500">Email</p>
                <p className="text-white">{selectedMessage.email}</p>
              </div>

              <div>
                <p className="text-zinc-500">Message</p>
                <p className="text-white">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Date</p>
                <p className="text-white">
                  {new Date(
                    selectedMessage.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QueriesPage;