'use client';

import { useState } from 'react';
import {
  useListPendingSellersQuery,
  useDecideSellerMutation,
} from '@/services/api/merchApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toaster';
import { Loader2, Check, X } from 'lucide-react';

export default function SellerApplicationsPage() {
  const { data, isLoading, refetch } = useListPendingSellersQuery();
  const [decide, { isLoading: isDeciding }] = useDecideSellerMutation();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const profiles = data?.profiles ?? [];

  const handleDecide = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      await decide({
        id,
        data: {
          status,
          notes: notes[id] || undefined,
        },
      }).unwrap();
      toast({
        title: status === 'approved' ? 'Seller approved' : 'Seller rejected',
      });
      refetch();
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.data?.error || 'Requires sellers.manage permission',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Seller applications</h1>
        <p className="text-sm text-muted-foreground">
          Review pending seller profile applications. Requires{' '}
          <code className="text-xs">sellers.manage</code>.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No pending applications.
        </p>
      ) : (
        <div className="space-y-4">
          {profiles.map((p) => (
            <div key={p.id} className="space-y-3 rounded-xl border p-4">
              <div>
                <h3 className="font-semibold">{p.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.user?.email || p.user?.username || p.user_id}
                </p>
                {p.bio && <p className="mt-2 text-sm">{p.bio}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Applied {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
              <Textarea
                placeholder="Decision notes"
                value={notes[p.id] ?? ''}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={isDeciding}
                  onClick={() => handleDecide(p.id, 'approved')}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDeciding}
                  onClick={() => handleDecide(p.id, 'rejected')}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
