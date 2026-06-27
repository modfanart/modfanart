import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contest & Submission Terms | MOD Platform',
  description:
    'Contest and Submission Terms governing participation in fan art contests on the MOD Platform',
};

export default function SubmissionTermsLayout({ children }: { children: ReactNode }) {
  return children;
}
