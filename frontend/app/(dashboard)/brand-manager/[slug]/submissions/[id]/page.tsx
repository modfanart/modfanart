import type { Metadata } from 'next';
import SubmissionDetailPageContent from './submission-detail-page';
import { notFound, redirect } from 'next/navigation';

interface SubmissionPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'View and manage your fan art submission details',
};

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { slug, id } = await params;

  if (id === 'new') {
    redirect(`/brand-manager/${slug}/submissions/new`);
    return null;
  }

  if (!id) {
    return notFound();
  }

  return <SubmissionDetailPageContent id={id} slug={slug} />;
}