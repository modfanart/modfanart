import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TermsSection } from '@/components/terms-section';
import { privacyPolicySections } from '../../../../lib/terms-data/privacyPolicySections';

export const metadata: Metadata = {
  title: 'Privacy Policy | MOD Platform',
  description: 'Privacy Policy for the MOD Platform fan art licensing service',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: March 6, 2025</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {privacyPolicySections.map((section, index) => (
            <TermsSection key={index} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
