import { describe, expect, it, jest, beforeEach } from "@jest/globals"
import { resetMocks } from "../../../../utils/test-utils"
import { mockDbFunctions } from "../../../../mocks/db-mocks"
import { createMockRequest } from "../../../../utils/test-utils"

// Mock the database functions
jest.mock("@/lib/db/config-service", () => ({
  getComplianceRules: mockDbFunctions.getComplianceRules,
}))

jest.mock("@/lib/db/models/submission", () => ({
  getSubmissionsByStatus: mockDbFunctions.getSubmissionsByStatus,
}))

// Import the API handler after mocking dependencies
import { GET } from "@/app/api/moderation/metrics/route"

describe("Moderation Metrics API Route", () => {
  beforeEach(() => {
    resetMocks()
    jest.clearAllMocks()
  })

  it("should require authorization", async () => {
    // Save original BYPASS_AUTH value
    const originalBypassAuth = process.env.BYPASS_AUTH
    // Disable bypass for this test
    process.env.BYPASS_AUTH = "false"

    const request = createMockRequest({
      method: "GET",
      // No authorization header
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual(
      expect.objectContaining({
        error: "Unauthorized",
      }),
    )

    // Restore original value
    process.env.BYPASS_AUTH = originalBypassAuth
  })

  it("should return metrics data for authorized requests", async () => {
    const request = createMockRequest({
      method: "GET",
      headers: {
        authorization: "Bearer admin-token",
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(
      expect.objectContaining({
        success: true,
        metrics: expect.objectContaining({
          submissionCounts: expect.objectContaining({
            pending: expect.any(Number),
            review: expect.any(Number),
            approved: expect.any(Number),
            rejected: expect.any(Number),
            licensed: expect.any(Number),
            total: expect.any(Number),
          }),
          aiDetection: expect.objectContaining({
            threshold: expect.any(Number),
            autoRejectThreshold: expect.any(Number),
          }),
          complianceSettings: expect.objectContaining({
            requireHumanReview: expect.any(Boolean),
            contentSafetyThreshold: expect.any(Number),
          }),
          timestamp: expect.any(String),
        }),
      }),
    )

    // Verify database functions were called
    expect(mockDbFunctions.getComplianceRules).toHaveBeenCalled()
    expect(mockDbFunctions.getSubmissionsByStatus).toHaveBeenCalledWith("pending")
    expect(mockDbFunctions.getSubmissionsByStatus).toHaveBeenCalledWith("review")
    expect(mockDbFunctions.getSubmissionsByStatus).toHaveBeenCalledWith("approved")
    expect(mockDbFunctions.getSubmissionsByStatus).toHaveBeenCalledWith("rejected")
    expect(mockDbFunctions.getSubmissionsByStatus).toHaveBeenCalledWith("licensed")
  })

  it("should handle database errors gracefully", async () => {
    // Make the database function throw an error for this test
    mockDbFunctions.getComplianceRules.mockRejectedValueOnce(new Error("Database failure"))

    const request = createMockRequest({
      method: "GET",
      headers: {
        authorization: "Bearer admin-token",
      },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual(
      expect.objectContaining({
        success: false,
        error: "Failed to fetch moderation metrics",
        details: "Database failure",
      }),
    )
  })
})

