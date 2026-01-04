import type { Metadata } from 'next';
import SubmissionDetailPageContent from './submission-detail-page';
import { notFound, redirect } from 'next/navigation';

interface SubmissionPageProps {
  params: Promise<{ id: string }>; // <-- params is now a Promise
}

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'View and manage your fan art submission details',
};

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { id } = await params; // <-- Await the promise to get the actual object

  // Redirect to new submission page if ID is "new"
  if (id === 'new') {
    redirect('/submissions/new');
    return null;
  }

  // Validate ID
  if (!id) {
    return notFound();
  }

  // You can also fetch data here if needed before rendering
  return <SubmissionDetailPageContent id={id} />;
}
