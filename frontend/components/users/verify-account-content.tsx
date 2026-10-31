'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { applyActionCode, reload, sendEmailVerification } from 'firebase/auth';
import { CheckCircle2, Loader2, MailCheck } from 'lucide-react';

import { firebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/store/AuthContext';
import { resolvePostLoginRedirect } from '@/lib/auth/redirect';
import { authErrorMessage } from '@/lib/auth/session';
import { withTimeout } from '@/lib/auth/timeout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RESEND_COOLDOWN_SECONDS = 60;

type Status = 'checking' | 'signed-out' | 'unverified' | 'verified' | 'link-error';

/**
 * /verify-account — where signup lands, where the verification email's link returns to,
 * and where a blocked action sends an unverified user (AUTH-03, AUTH-13).
 *
 * The link in the email goes to Firebase's action handler, which verifies the address and
 * then offers a "Continue" link back here. If the project is later configured to send the
 * link straight to this page, `mode=verifyEmail&oobCode=…` is handled here too.
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading } = useAuth();

  const next = resolvePostLoginRedirect(searchParams.get('next'));
  const justSent = searchParams.get('sent') === '1';
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [status, setStatus] = useState<Status>('checking');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    justSent ? 'We sent a verification link to your inbox.' : null
  );
  const [busy, setBusy] = useState<'check' | 'resend' | null>(null);
  const [cooldown, setCooldown] = useState(justSent ? RESEND_COOLDOWN_SECONDS : 0);
  const appliedCode = useRef(false);

  /** Re-read the Firebase user; on success force a new token so the backend records it. */
  const refreshVerification = useCallback(async () => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      setStatus('signed-out');
      return false;
    }

    await withTimeout(reload(user));
    if (user.emailVerified) {
      // The fresh token carries email_verified=true; the token listener syncs it to the
      // server and refreshes the profile, which clears the site-wide banner.
      await withTimeout(user.getIdToken(true));
      setStatus('verified');
      return true;
    }

    setStatus('unverified');
    return false;
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Initial state, once Firebase has restored any session.
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      try {
        if (mode === 'verifyEmail' && oobCode && !appliedCode.current) {
          appliedCode.current = true;
          await withTimeout(applyActionCode(firebaseAuth, oobCode));
          if (firebaseAuth.currentUser) {
            await refreshVerification();
          } else {
            setStatus('verified');
          }
          return;
        }

        await refreshVerification();
      } catch (err: any) {
        if (mode === 'verifyEmail' && oobCode) {
          setStatus('link-error');
          setError(
            err?.code === 'auth/invalid-action-code' || err?.code === 'auth/expired-action-code'
              ? 'This verification link has expired or was already used.'
              : authErrorMessage(err)
          );
        } else {
          setStatus(firebaseAuth.currentUser?.emailVerified ? 'verified' : 'unverified');
          setError(authErrorMessage(err));
        }
      }
    })();
  }, [authLoading, mode, oobCode, refreshVerification]);

  const onCheck = async () => {
    setBusy('check');
    setError(null);
    setNotice(null);
    try {
      const verified = await refreshVerification();
      if (!verified) {
        setNotice("We haven't seen the confirmation yet. Click the link in the email, then try again.");
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const onResend = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) return;
    setBusy('resend');
    setError(null);
    setNotice(null);
    try {
      await withTimeout(
        sendEmailVerification(user, {
          url: `${window.location.origin}/verify-account?next=${encodeURIComponent(next)}`,
        })
      );
      setNotice(`We sent a new link to ${user.email}.`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const email = firebaseAuth.currentUser?.email;

  return (
    <div className="space-y-6 py-12 text-center">
      {status === 'checking' && (
        <div className="flex flex-col items-center gap-3 text-gray-600" role="status">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
          <p>Checking your account…</p>
        </div>
      )}

      {status === 'verified' && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Email verified</h1>
            <p className="mt-2 text-gray-600">
              Your account is fully set up. You can now submit artwork and enter contests.
            </p>
          </div>
          {firebaseAuth.currentUser ? (
            <Button className="w-full h-11 bg-black hover:bg-gray-900" onClick={() => router.push(next)}>
              Continue
            </Button>
          ) : (
            <Button asChild className="w-full h-11 bg-black hover:bg-gray-900">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </>
      )}

      {status === 'unverified' && (
        <>
          <MailCheck className="mx-auto h-12 w-12 text-violet-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Check your inbox</h1>
            <p className="mt-2 text-gray-600">
              Your account is created. To finish, confirm your email address
              {email ? (
                <>
                  {' '}
                  — we sent a link to <span className="font-medium text-gray-900">{email}</span>
                </>
              ) : null}
              .
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You can look around in the meantime, but submitting artwork, entering contests and
              requesting brand verification unlock once your email is confirmed.
            </p>
          </div>

          {notice && (
            <Alert>
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              className="w-full h-11 bg-black hover:bg-gray-900"
              onClick={onCheck}
              disabled={busy !== null}
            >
              {busy === 'check' ? 'Checking…' : "I've confirmed my email"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={onResend}
              disabled={busy !== null || cooldown > 0}
            >
              {busy === 'resend'
                ? 'Sending…'
                : cooldown > 0
                ? `Resend email (${cooldown}s)`
                : 'Resend email'}
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Can&apos;t find it? Check your spam folder.{' '}
            <Link href={next} className="text-violet-600 hover:underline">
              Continue browsing
            </Link>
          </p>
        </>
      )}

      {status === 'signed-out' && (
        <>
          <MailCheck className="mx-auto h-12 w-12 text-violet-600" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold">Verify your email</h1>
            <p className="mt-2 text-gray-600">
              Sign in to check your verification status or get a new link.
            </p>
          </div>
          <Button asChild className="w-full h-11 bg-black hover:bg-gray-900">
            <Link href={`/login?from=${encodeURIComponent('/verify-account')}`}>Sign in</Link>
          </Button>
        </>
      )}

      {status === 'link-error' && (
        <>
          <div>
            <h1 className="text-3xl font-bold">Link not valid</h1>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <Button asChild className="w-full h-11 bg-black hover:bg-gray-900">
            <Link href="/verify-account">Get a new link</Link>
          </Button>
        </>
      )}
    </div>
  );
}

export default VerifyEmailContent;
