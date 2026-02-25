"use client"

import type { Metadata } from 'next';
// Import voter page content component
import { notFound, redirect } from 'next/navigation';
import JudgeClient from './judge-client';

interface JudgeProps {
  params: {
    id: string
    // contestId: string
  }
}


const getJudgeData = (id: string) => {
  // In a real application, you would fetch this data from your backend using the link
  // For this example, we'll return the sample judge data based on the link
    const sampleJudge1 = {
        id: 'wtK0bkFZkbaB',
        email: 'judge@example.com',
        name: 'John Doe',
        contestId: 'the-librarians'
    }
    const sampleJudge2 = {
        id: 'dEfD2vBg7pan',
        email: '',
        name: '',
        contestId: 'the-librarians'
    }
  return sampleJudge2
}

export default async function JudgePage({ params }: JudgeProps) {
  
  const { id } = await params
  const judgeData = await getJudgeData(id)

  if (!id || !judgeData) {
    notFound()
  }

  return <JudgeClient judgeData={judgeData} />
}