import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetMocks } from '../../../utils/test-utils';
import { mockDbFunctions } from '../../../mocks/db-mocks';
import { createMockRequest } from '../../../utils/test-utils';

// Mock the database functions
jest.mock('@/lib/db/models/user', () => ({
  getUserById: mockDbFunctions.getUserById,
}));

jest.mock('@/lib/db/models/submission', () => ({
  createSubmission: mockDbFunctions.createSubmission,
}));

jest.mock('@/lib/services/moderation-service', () => ({
  analyzeSubmission: jest.fn().mockImplementation(async () => ({
    aiDetection: {
      score: 0.2,
      isAiGenerated: false,
      confidence: 0.95,
      humanVerified: false,
    },
    contentAnalysis: {
      ipCompliance: { score: 3, issues: [], riskLevel: 'low' },
      contentSafety: { score: 2, issues: [], riskLevel: 'low' },
      brandGuidelines: { adherence: 'high', issues: [], notes: '' },
      overallRiskScore: 2,
      recommendation: 'approve',
      reasoningSummary: 'Content appears to be original and safe',
    },
    finalRecommendation: 'approve',
    needsHumanReview: false,
  })),
}));

// Import the API handler after mocking dependencies
import { POST } from '@/app/api/moderation/route';
import { analyzeSubmission } from '@/lib/services/moderation-service';

describe('Moderation API Route', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  it('should validate request body and return 400 for invalid requests', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        // Missing required fields
        title: 'Test Submission',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual(
      expect.objectContaining({
        success: false,
        errors: expect.any(Array),
      })
    );
  });

  it('should return 404 if user is not found', async () => {
    // Override the mock to return null for this test
    mockDbFunctions.getUserById.mockResolvedValueOnce(null);

    const request = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Submission',
        description: 'Test Description',
        category: 'fan art',
        originalIp: 'Test IP',
        tags: ['test', 'fan art'],
        imageUrl: 'https://example.com/test.jpg',
        licenseType: 'standard',
        userId: 'non-existent-user',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual(
      expect.objectContaining({
        error: 'User not found',
      })
    );
  });

  it('should process a valid submission and return analysis results', async () => {
    const submissionData = {
      title: 'Test Submission',
      description: 'Test Description',
      category: 'fan art',
      originalIp: 'Test IP',
      tags: ['test', 'fan art'],
      imageUrl: 'https://example.com/test.jpg',
      licenseType: 'standard',
      userId: 'user-123',
    };

    const request = createMockRequest({
      method: 'POST',
      body: submissionData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(
      expect.objectContaining({
        success: true,
        analysis: expect.objectContaining({
          aiDetection: expect.any(Object),
          contentAnalysis: expect.any(Object),
          finalRecommendation: 'approve',
        }),
        submission: expect.objectContaining({
          title: 'Test Submission',
          status: 'pending', // Approved submissions start as pending
        }),
        requestId: expect.any(String),
      })
    );

    // Verify service was called with correct parameters
    expect(analyzeSubmission).toHaveBeenCalledWith(
      submissionData.title,
      submissionData.description,
      submissionData.category,
      submissionData.originalIp,
      submissionData.tags,
      submissionData.imageUrl
    );

    // Verify submission was created with correct data
    expect(mockDbFunctions.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        title: submissionData.title,
        status: 'pending',
        userId: submissionData.userId,
      })
    );
  });

  it('should handle service errors gracefully', async () => {
    // Make the service throw an error for this test
    (analyzeSubmission as jest.Mock).mockRejectedValueOnce(new Error('Service failure'));

    const request = createMockRequest({
      method: 'POST',
      body: {
        title: 'Test Submission',
        description: 'Test Description',
        category: 'fan art',
        originalIp: 'Test IP',
        tags: ['test', 'fan art'],
        imageUrl: 'https://example.com/test.jpg',
        licenseType: 'standard',
        userId: 'user-123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(
      expect.objectContaining({
        success: false,
        error: 'Failed to process submission',
        details: 'Service failure',
      })
    );
  });
});
