'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface JudgeCredentials {
  username: string;
  email: string;
  password: string;
  inviteUrl: string;
  emailSent: boolean;
}

const COPIED_RESET_MS = 2000;

type CopyState = 'idle' | 'copied' | 'failed';

function useCopyToClipboard(): [CopyState, (value: string) => Promise<void>] {
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    if (state !== 'copied') return;
    const id = setTimeout(() => setState('idle'), COPIED_RESET_MS);
    return () => clearTimeout(id);
  }, [state]);

  const copy = async (value: string) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API is not available');
      }
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch (err) {
      // Clipboard access is refused on plain http and by some permission
      // policies. The value is rendered as selectable text either way, so
      // report the failure instead of showing a "Copied" that did nothing.
      console.error('Failed to copy judge credential to clipboard:', err);
      setState('failed');
    }
  };

  return [state, copy];
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copyState, copy] = useCopyToClipboard();
  const hasCopied = copyState === 'copied';

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-start gap-2">
        <code className="flex-1 p-3 border rounded-md text-sm break-all bg-muted/30 select-all">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy(value)}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {copyState === 'failed' && (
        <p className="text-xs text-destructive">
          Copy is not available here. Select the text above to copy it.
        </p>
      )}
    </div>
  );
}

const PASSWORD_GUIDANCE =
  'Save and share the password with the judge now: it is shown only once. The invite link ' +
  'alone signs them into the dashboard, but they still need this password to log in the ' +
  'first time.';

function inviteStatusMessage({ email, emailSent }: JudgeCredentials): string {
  return emailSent
    ? `An invite email with a one-time access link has been sent to ${email}.`
    : 'The invite email could not be sent. Share the one-time link below with the judge manually.';
}

/**
 * Shown once after "Create & Assign Judge" succeeds. The temporary password is
 * generated in the browser and never stored, so this dialog is the brand's
 * only chance to copy it: every value is selectable, has its own Copy button,
 * and the dialog only closes on a deliberate action (Done, Escape or the X),
 * never on a stray click outside it.
 */
export function JudgeCredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: JudgeCredentials | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={credentials !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {credentials && (
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Judge &quot;{credentials.username}&quot; created</DialogTitle>
            <DialogDescription>{inviteStatusMessage(credentials)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <CopyableField label="Temporary password" value={credentials.password} />
            <CopyableField label="Invite link" value={credentials.inviteUrl} />
            <p className="text-sm text-muted-foreground">{PASSWORD_GUIDANCE}</p>
          </div>

          <DialogFooter>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
