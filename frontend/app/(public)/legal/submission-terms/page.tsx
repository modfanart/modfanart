import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TermsSection } from '@/components/terms-section';
import { contestSubmissionSections } from '../../../../lib/terms-data/contestSubmissionSections';

export const metadata: Metadata = {
  title: 'Contest & Submission Terms | MOD Platform',
  description:
    'Contest and Submission Terms governing participation in fan art contests on the MOD Platform',
};

export default function SubmissionTermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contest &amp; Submission Terms</h1>
              <p className="text-muted-foreground">
                Terms governing participation in MOD Fan Official contests and submissions
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {contestSubmissionSections.map((section, i) => (
            <TermsSection key={i} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
