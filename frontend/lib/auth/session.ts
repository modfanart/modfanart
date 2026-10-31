/**
 * The one way the browser exchanges a Firebase ID token for our application session
 * (POST /auth/sync). Login, signup, Google sign-in and the background token listener all
 * used to hand-roll this fetch, each with no timeout and each throwing away the server's
 * error message.
 */
import { API_BASE_URL } from '@/services';
import type { SyncedUser } from '@/services/api/authApi';
import { AUTH_TIMEOUT_CODE, fetchWithTimeout } from './timeout';

export interface SyncBody {
  accountType?: 'fan' | 'artist' | 'brand';
  username?: string;
  acceptedTerms?: boolean;
}

export interface SyncResult {
  user: (SyncedUser & { email_verified?: boolean }) | null;
  isNewUser: boolean;
  requiresSignup?: boolean;
}

/** A non-2xx from our API, carrying the server's message and machine-readable code. */
export class AuthApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

export async function syncSession(idToken: string, body?: SyncBody): Promise<SyncResult> {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/auth/sync`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    },
    undefined,
    'Signing in'
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AuthApiError(
      res.status,
      data?.error || data?.message || 'We could not reach the server. Please try again.',
      data?.code
    );
  }

  return data as SyncResult;
}

/**
 * A sentence to show the person for anything thrown during sign-in or signup.
 * Unknown errors get a generic retry message rather than a raw Firebase string.
 */
export function authErrorMessage(err: unknown): string {
  const error = err as { code?: string; message?: string } | null;

  if (err instanceof AuthApiError) return err.message;

  switch (error?.code) {
    case AUTH_TIMEOUT_CODE:
      return error.message || 'That took too long. Check your connection and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'That password is too weak. Use at least 8 characters with upper and lower case letters and a number.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
    case 'auth/requires-recent-login':
      return 'For your security, sign out and sign back in, then try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
