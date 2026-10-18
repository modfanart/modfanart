import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

import { useResolveModerationItemMutation } from '../../services/api/moderationApi';

import { getApiErrorMessage } from './format';

const DECISION_COPY = {
  approved: {
    title: 'Approve',
    description: 'The artwork is marked approved and leaves the queue.',
    confirmClassName: 'bg-emerald-600 text-white hover:bg-emerald-500',
  },
  rejected: {
    title: 'Reject',
    description: 'The artwork is marked rejected and leaves the queue.',
    confirmVariant: 'destructive',
  },
  escalated: {
    title: 'Escalate',
    description:
      'The item stays open and moves to the Escalated tab for platform moderators.',
  },
};

// Keyed by item + decision so the notes start empty every time the dialog opens.
const ResolveForm = ({ item, decision, onDone }) => {
  const [notes, setNotes] = useState('');
  const [resolveItem, { isLoading }] = useResolveModerationItemMutation();

  const copy = DECISION_COPY[decision];
  const subject = item.artwork?.title || 'this item';

  const handleConfirm = async () => {
    try {
      const result = await resolveItem({
        id: item.id,
        decision,
        notes: notes.trim(),
      }).unwrap();

      toast.success(result?.message || 'Decision recorded');
      onDone();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resolve the item'));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-white">
          {copy.title} “{subject}”
        </DialogTitle>
        <DialogDescription>{copy.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="resolve-notes" className="text-zinc-300">
          Notes (optional)
        </Label>
        <Textarea
          id="resolve-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Recorded in the audit trail with your decision"
          className="border-zinc-800 bg-zinc-950"
        />
      </div>

      <DialogFooter className="gap-2 sm:space-x-0">
        <Button
          variant="outline"
          onClick={onDone}
          disabled={isLoading}
          className="border-zinc-700"
        >
          Cancel
        </Button>
        <Button
          variant={copy.confirmVariant}
          onClick={handleConfirm}
          disabled={isLoading}
          className={copy.confirmClassName}
        >
          {isLoading ? 'Saving…' : copy.title}
        </Button>
      </DialogFooter>
    </>
  );
};

/** `target` is `{ item, decision }` while open, null while closed. */
export const ResolveDialog = ({ target, onClose }) => (
  <Dialog open={!!target} onOpenChange={open => !open && onClose()}>
    <DialogContent className="bg-zinc-900 border-zinc-800">
      {target && (
        <ResolveForm
          key={`${target.item.id}-${target.decision}`}
          item={target.item}
          decision={target.decision}
          onDone={onClose}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default ResolveDialog;
