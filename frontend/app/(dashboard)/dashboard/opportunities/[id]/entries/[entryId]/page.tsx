import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SubmissionDetail from './submission-detail';

interface EntryPageProps {
  params: Promise<{ id: string; entryId: string }>;
}

export const metadata: Metadata = {
  title: 'Submission Details',
  description: 'Review a full contest submission and everything its submitter provided',
};

export default async function EntryPage({ params }: EntryPageProps) {
  const { id, entryId } = await params;

  if (!id || !entryId) {
    return notFound();
  }

  return <SubmissionDetail contestId={id} entryId={entryId} />;
}
