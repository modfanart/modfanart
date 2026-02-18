import { mockFetchResponse } from '../utils/test-utils';

// Mock AIORNOT API responses
export const mockAIOrNotResponse = {
  success: (imageUrl: string) => ({
    ai_score: 0.2,
    confidence: 0.95,
    human_verified: false,
    image_url: imageUrl,
  }),
  aiGenerated: (imageUrl: string) => ({
    ai_score: 0.85,
    confidence: 0.92,
    human_verified: false,
    image_url: imageUrl,
  }),
  error: () => ({
    error: 'Failed to analyze image',
    message: 'Service temporarily unavailable',
  }),
};

// Mock OpenAI API responses
export const mockOpenAIResponse = {
  success: () => ({
    id: 'chatcmpl-123',
    object: 'chat.completion',
    created: 1677858242,
    model: 'gpt-4',
    usage: {
      prompt_tokens: 56,
      completion_tokens: 31,
      total_tokens: 87,
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify({
            ipCompliance: { score: 3, issues: [], riskLevel: 'low' },
            contentSafety: { score: 2, issues: [], riskLevel: 'low' },
            brandGuidelines: { adherence: 'high', issues: [], notes: 'Follows guidelines well' },
            overallRiskScore: 2,
            recommendation: 'approve',
            reasoningSummary: 'Content appears to be original and safe',
          }),
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  }),
  reject: () => ({
    id: 'chatcmpl-456',
    object: 'chat.completion',
    created: 1677858242,
    model: 'gpt-4',
    usage: {
      prompt_tokens: 56,
      completion_tokens: 31,
      total_tokens: 87,
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify({
            ipCompliance: {
              score: 8,
              issues: ['Direct copy of protected character'],
              riskLevel: 'high',
            },
            contentSafety: {
              score: 7,
              issues: ['Potentially inappropriate content'],
              riskLevel: 'medium',
            },
            brandGuidelines: {
              adherence: 'low',
              issues: ['Violates brand style guide'],
              notes: 'Does not align with brand values',
            },
            overallRiskScore: 8,
            recommendation: 'reject',
            reasoningSummary:
              'Content appears to infringe on IP and contains inappropriate elements',
          }),
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  }),
  review: () => ({
    id: 'chatcmpl-789',
    object: 'chat.completion',
    created: 1677858242,
    model: 'gpt-4',
    usage: {
      prompt_tokens: 56,
      completion_tokens: 31,
      total_tokens: 87,
    },
    choices: [
      {
        message: {
          role: 'assistant',
          content: JSON.stringify({
            ipCompliance: {
              score: 5,
              issues: ['Similarity to protected character'],
              riskLevel: 'medium',
            },
            contentSafety: { score: 4, issues: [], riskLevel: 'low' },
            brandGuidelines: {
              adherence: 'medium',
              issues: ['Minor style inconsistencies'],
              notes: 'Generally follows guidelines with some exceptions',
            },
            overallRiskScore: 5,
            recommendation: 'review',
            reasoningSummary: 'Content has some elements that require human review',
          }),
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  }),
  error: () => ({
    error: {
      message: 'The server had an error processing your request',
      type: 'server_error',
      code: 'internal_server_error',
    },
  }),
  malformed: () => ({
    id: 'chatcmpl-999',
    object: 'chat.completion',
    created: 1677858242,
    model: 'gpt-4',
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'This is not valid JSON',
        },
        finish_reason: 'stop',
        index: 0,
      },
    ],
  }),
};

// Setup mock responses for AI services
export function setupAIMocks(options: {
  aiOrNotResponse?: 'success' | 'aiGenerated' | 'error';
  openAIResponse?: 'success' | 'reject' | 'review' | 'error' | 'malformed';
  imageUrl?: string;
}) {
  const {
    aiOrNotResponse = 'success',
    openAIResponse = 'success',
    imageUrl = 'https://example.com/image.jpg',
  } = options;

  // Mock AIORNOT API
  if (aiOrNotResponse === 'success') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockAIOrNotResponse.success(imageUrl))
    );
  } else if (aiOrNotResponse === 'aiGenerated') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockAIOrNotResponse.aiGenerated(imageUrl))
    );
  } else {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(500, mockAIOrNotResponse.error())
    );
  }

  // Mock OpenAI API
  if (openAIResponse === 'success') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockOpenAIResponse.success())
    );
  } else if (openAIResponse === 'reject') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockOpenAIResponse.reject())
    );
  } else if (openAIResponse === 'review') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockOpenAIResponse.review())
    );
  } else if (openAIResponse === 'malformed') {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, mockOpenAIResponse.malformed())
    );
  } else {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(500, mockOpenAIResponse.error())
    );
  }
}
