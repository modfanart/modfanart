// lib/ai/analyze-submission.ts

// Temporary fallback when Grok is preferred but not enabled
// This matches your original legacy analysis shape

export type LegacyAnalysisResult = {
  finalRecommendation: 'approve' | 'review' | 'reject';
  aiDetection: {
    score: number; // 0-1, higher = more likely AI
    isAiGenerated: boolean;
  };
  contentAnalysis: {
    reasoningSummary: string;
    flags: string[];
  };
};

export default async function analyzeSubmission(data: {
  title: string;
  description: string;
  category: string;
  originalIp: string;
  tags: string[];
  imageUrl: string;
}): Promise<LegacyAnalysisResult> {
  // This is a temporary stub — replace with your real OpenAI + AIorNot logic
  console.warn('Using fallback legacy analysis — implement real logic here');

  // Simulate some analysis
  return {
    finalRecommendation: 'review',
    aiDetection: {
      score: 0.3,
      isAiGenerated: false,
    },
    contentAnalysis: {
      reasoningSummary: 'Content appears original and within guidelines.',
      flags: [],
    },
  };
}
