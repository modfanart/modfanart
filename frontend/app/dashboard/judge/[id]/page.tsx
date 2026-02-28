'use client'; // ← you can keep this if JudgeClient needs client features
// but the page itself can still be a server component

import { notFound } from 'next/navigation';
import JudgeClient from './judge-client';

// Correct props type for dynamic route in App Router (server component)
interface JudgePageProps {
  params: Promise<{
    id: string;
  }>;
  // searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const getJudgeData = async (id: string) => {
  // In real app: fetch from API
  // For demo:
  const sampleJudge1 = {
    id: 'wtK0bkFZkbaB',
    email: 'judge@example.com',
    name: 'John Doe',
    contestId: 'the-librarians',
  };
  const sampleJudge2 = {
    id: 'dEfD2vBg7pan',
    email: '',
    name: '',
    contestId: 'the-librarians',
  };

  // Simulate DB lookup
  if (id === sampleJudge1.id) return sampleJudge1;
  if (id === sampleJudge2.id) return sampleJudge2;

  return null; // or throw new Error(), or return default
};

export default async function JudgePage({ params }: JudgePageProps) {
  // Await the params Promise (required in server components)
  const { id } = await params;

  const judgeData = await getJudgeData(id);

  if (!judgeData) {
    notFound();
  }

  return <JudgeClient judgeData={judgeData} />;
}
