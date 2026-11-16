'use client';

// Account standing prompts (GA-05 email verification, GA-22 terms/18+).
// The API refuses contest entries, votes, checkout and selling until both are
// satisfied; this tells signed-in users why and lets them fix it in place.

import { useState } from 'react';
import { reload, sendEmailVerification } from 'firebase/auth';
import { MailWarning } from 'lucide-react';
import Link from 'next/link';

import { firebaseAuth } from '@/lib/firebase';
import { useAppDispatch } from '@/store/hooks';
import { setToken } from '@/services/api/features/authSlice';
import { useGetCurrentUserQuery, useRecordConsentMutation, userApi } from '@/services/api/userApi';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { TERMS_VERSION } from '@/lib/policy';

export function AccountStanding() {
  const { user } = useAuth();
  const { data } = useGetCurrentUserQuery(undefined, { skip: !user });
  const standing = data?.user?.standing;

  if (!user || !standing || standing === 'ok') return null;
  return standing === 'email_unverified' ? <VerifyEmailBanner email={user.email} /> : <TermsDialog />;
}

function VerifyEmailBanner({ email }: { email: string }) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'resend' | 'check' | null>(null);

  const resend = async () => {
    const fbUser = firebaseAuth.currentUser;
    if (!fbUser) return;
    setBusy('resend');
    try {
      await sendEmailVerification(fbUser, { url: `${window.location.origin}/verify-account` });
      toast({ title: 'Verification email sent', description: `Check ${email} (and your spam folder).` });
    } catch (e: any) {
      toast({
        title: "Couldn't send the email",
        description:
          e?.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  const check = async () => {
    const fbUser = firebaseAuth.currentUser;
    if (!fbUser) return;
    setBusy('check');
    try {
      await reload(fbUser);
      if (fbUser.emailVerified) {
        // Fresh token carries email_verified=true for the API.
        dispatch(setToken(await fbUser.getIdToken(true)));
        dispatch(userApi.util.invalidateTags(['CurrentUser']));
        toast({ title: 'Email verified', description: 'Thanks! Everything is unlocked.' });
      } else {
        toast({ title: 'Not verified yet', description: 'Open the link in the email we sent, then try again.' });
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[72px] z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-b-xl border border-warning-strong/30 bg-warning-subtle px-4 py-3 text-sm text-warning-strong shadow-sm"
    >
      <MailWarning className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Verify <strong>{email}</strong> to enter contests, vote, sell or check out.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={resend} disabled={busy !== null}>
          {busy === 'resend' ? 'Sending…' : 'Resend email'}
        </Button>
        <Button size="sm" onClick={check} disabled={busy !== null}>
          {busy === 'check' ? 'Checking…' : "I've verified"}
        </Button>
      </div>
    </div>
  );
}

function TermsDialog() {
  const [accepted, setAccepted] = useState(false);
  const [adult, setAdult] = useState(false);
  const [recordConsent, { isLoading }] = useRecordConsentMutation();
  const { toast } = useToast();

  const submit = async () => {
    try {
      await recordConsent({ termsVersion: TERMS_VERSION, ageConfirmed: true }).unwrap();
    } catch (e: any) {
      toast({
        title: "Couldn't save",
        description: e?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Please review our updated terms</DialogTitle>
          <DialogDescription>
            To keep entering contests, voting, selling and buying on MOD, accept the current Terms
            of Service and confirm your age.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
            <span>
              I agree to the{' '}
              <Link href="/legal/terms-and-service" target="_blank" className="text-primary underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy-policy" target="_blank" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={adult} onCheckedChange={(v) => setAdult(v === true)} />
            <span>I confirm I am 18 years of age or older.</span>
          </label>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!accepted || !adult || isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving…' : 'Accept and continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
