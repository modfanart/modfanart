'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { loginWithReturnTo } from '@/lib/auth/redirect';

// Entry point for a one-time judge invite link. Does no validation itself —
// validation + single-use consumption both happen atomically in the
// /complete step's redeem call, which requires the user to be authenticated
// first. That way an abandoned visit (closing the tab at the login screen)
// never burns the token.
export default function JudgeInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const completePath = `/judge/invite/${token}/complete`;

    if (user) {
      // Already signed in — skip the login screen entirely.
      router.replace(completePath);
      return;
    }

    router.replace(loginWithReturnTo(completePath));
  }, [user, loading, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Verifying your invite...</span>
      </div>
    </div>
  );
}