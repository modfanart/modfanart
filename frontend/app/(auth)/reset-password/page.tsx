import { redirect } from 'next/navigation';

// Password resets are completed on Firebase's hosted page from the emailed link; this route
// only exists for old links and bookmarks. It used to redirect to itself in a loop.
export default function ResetPasswordRedirect() {
  redirect('/forgot-password');
}
