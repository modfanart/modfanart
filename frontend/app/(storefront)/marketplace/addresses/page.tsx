'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { AddressForm, AddressSummary } from '@/components/marketplace/address-form';
import { RequireAuth } from '@/components/marketplace/require-auth';
import {
  getApiErrorMessage,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  type Address,
} from '@/services/api/marketplaceApi';

function AddressesContent() {
  const { toast } = useToast();
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [remove] = useDeleteAddressMutation();

  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Address book</h1>
          <p className="text-muted-foreground">Where we send your merch.</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="mr-2 h-4 w-4" /> New address
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : addresses && addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="flex flex-col justify-between gap-4 rounded-lg border p-5">
              <div className="space-y-2">
                {a.is_default && <Badge variant="secondary">Default</Badge>}
                <AddressSummary address={a} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    remove(a.id)
                      .unwrap()
                      .then(() => toast({ title: 'Address removed' }))
                      .catch((err) =>
                        toast({
                          title: "Couldn't remove address",
                          description: getApiErrorMessage(err),
                          variant: 'destructive',
                        })
                      )
                  }
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No saved addresses yet.
        </p>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing === 'new' ? 'New address' : 'Edit address'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <AddressForm
              address={editing === 'new' ? undefined : editing}
              onSaved={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <RequireAuth message="Sign in to manage your addresses.">
      <AddressesContent />
    </RequireAuth>
  );
}
