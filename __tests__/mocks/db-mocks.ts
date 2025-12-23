// Mock database models and services
import { jest } from "@jest/globals"

// Mock user model
export const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  role: "artist",
}

// Mock submission model
export const mockSubmission = {
  id: "submission-123",
  title: "Test Submission",
  description: "This is a test submission",
  category: "fan art",
  originalIp: "Test IP",
  tags: ["test", "fan art"],
  status: "pending",
  imageUrl: "https://example.com/image.jpg",
  licenseType: "standard",
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock compliance rules
export const mockComplianceRules = {
  aiDetectionThreshold: 0.7,
  autoRejectThreshold: 0.9,
  autoApproveThreshold: 0.3,
  requireHumanReview: true,
  contentSafetyThreshold: 0.6,
  ipComplianceThreshold: 0.7,
}

// Mock AI settings
export const mockAISettings = {
  models: {
    compliance: "gpt-4",
    feedback: "gpt-3.5-turbo",
  },
  promptTemplates: {
    compliance: "You are an expert in IP compliance and content moderation.",
    feedback: "You are an expert in providing constructive feedback to artists.",
  },
}

// Mock database functions
export const mockDbFunctions = {
  getUserById: jest.fn().mockResolvedValue(mockUser),
  createSubmission: jest.fn().mockImplementation((data) => ({
    ...mockSubmission,
    ...data,
  })),
  getSubmissionsByStatus: jest.fn().mockImplementation((status) => {
    if (status === "pending") return [mockSubmission, mockSubmission]
    if (status === "review") return [mockSubmission]
    if (status === "approved") return [mockSubmission, mockSubmission, mockSubmission]
    if (status === "rejected") return [mockSubmission, mockSubmission]
    if (status === "licensed") return [mockSubmission]
    return []
  }),
  getComplianceRules: jest.fn().mockResolvedValue(mockComplianceRules),
  getAISettings: jest.fn().mockResolvedValue(mockAISettings),
}

// Setup database mocks
export function setupDbMocks() {
  jest.mock("@/lib/db/models/user", () => ({
    getUserById: mockDbFunctions.getUserById,
  }))

  jest.mock("@/lib/db/models/submission", () => ({
    createSubmission: mockDbFunctions.createSubmission,
    getSubmissionsByStatus: mockDbFunctions.getSubmissionsByStatus,
  }))

  jest.mock("@/lib/db/config-service", () => ({
    getComplianceRules: mockDbFunctions.getComplianceRules,
    getAISettings: mockDbFunctions.getAISettings,
  }))
}

