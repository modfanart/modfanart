import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TermsSection } from '@/components/terms-section';
import { termsSections } from '../../../../lib/terms-data/termsSections';

export const metadata: Metadata = {
  title: 'Terms of Service | MOD Platform',
  description: 'Terms of Service for the MOD Platform fan art licensing service',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: March 6, 2025</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {termsSections.map((section, i) => (
            <TermsSection key={i} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
