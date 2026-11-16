'use client';

// Handles Firebase email-verification links (AUTH-03 / GA-05).
//
// The old version called GET /api/auth/verify-email?token=…, an endpoint
// that never existed, so every link failed. Firebase sends
// ?mode=verifyEmail&oobCode=… when the project's action URL points here
// (Firebase console → Authentication → Templates → Customise action URL →
// https://<site>/verify-account). When Firebase's own hosted page handles the
// link instead, it redirects here with no code: we then just refresh the
// session.

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { applyActionCode, reload } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useAppDispatch } from '@/store/hooks';
import { setToken } from '@/services/api/features/authSlice';
import { userApi } from '@/services/api/userApi';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const finish = async () => {
      const u = firebaseAuth.currentUser;
      if (u) {
        await reload(u);
        dispatch(setToken(await u.getIdToken(true)));
        dispatch(userApi.util.invalidateTags(['CurrentUser']));
      }
      setStatus('success');
      setMessage('Your email has been verified. Contests, voting and checkout are now unlocked.');
      setTimeout(() => router.push(u ? '/' : '/login'), 2500);
    };

    const run = async () => {
      try {
        if (oobCode && (!mode || mode === 'verifyEmail')) {
          await applyActionCode(firebaseAuth, oobCode);
        } else if (oobCode) {
          throw new Error('This link is not an email-verification link.');
        }
        await finish();
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.code === 'auth/invalid-action-code' || err?.code === 'auth/expired-action-code'
            ? 'This verification link has expired or was already used. Sign in and use "Resend email".'
            : err?.message || 'Verification failed.'
        );
      }
    };

    run();
  }, [mode, oobCode, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full bg-background shadow-md rounded-xl p-8 text-center space-y-4">
        {status === 'loading' && (
          <>
            <h2 className="text-xl font-semibold">Verifying...</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-xl font-semibold text-success">Success ✅</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-destructive">Error ❌</h2>
            <p className="text-muted-foreground">{message}</p>

            <Link
              href="/login"
              className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailContent;
