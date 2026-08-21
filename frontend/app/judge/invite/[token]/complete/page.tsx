'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useRedeemJudgeInviteMutation } from '@/services/api/contestsApi';

export default function JudgeInviteCompletePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [redeemInvite] = useRedeemJudgeInviteMutation();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Session didn't stick (or was cleared) between the bounce and here —
      // send them back through the invite entry point rather than failing silently.
      router.replace(`/judge/invite/${token}`);
      return;
    }

    if (attempted.current) return;
    attempted.current = true;

    redeemInvite({ token })
      .unwrap()
      .then((res) => {
        router.replace(res.redirect_to);
      })
      .catch((err) => {
        const message =
          err?.data?.message ||
          (err?.data?.error === 'wrong_account'
            ? 'This invite link was issued to a different account than the one you\'re signed in with.'
            : err?.data?.error === 'already_used'
            ? 'This invite link has already been used.'
            : err?.data?.error === 'expired'
            ? 'This invite link has expired.'
            : 'This invite link is invalid.');
        setError(message);
      });
  }, [authLoading, user, token, redeemInvite, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-lg font-semibold">Couldn&apos;t open this invite</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link href={user?.username ? `/judge/${user.username.toLowerCase()}` : '/login'} className="text-sm underline">
            Go to your judge dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Opening judging dashboard...</span>
      </div>
    </div>
  );
}