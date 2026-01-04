import { describe, expect, it, type jest, beforeEach } from "@jest/globals"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { ModerationDashboard } from "@/components/compliance/moderation-dashboard"
import { resetMocks, mockFetchResponse } from "../../utils/test-utils"

describe("ModerationDashboard", () => {
  beforeEach(() => {
    resetMocks()
  })

  it("should display loading state initially", () => {
    // Mock fetch to never resolve for this test
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}))

    render(<ModerationDashboard />)

    expect(screen.getByText("Loading moderation metrics...")).toBeInTheDocument()
  })

  it("should fetch and display metrics data", async () => {
    // Mock successful metrics response
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, {
        success: true,
        metrics: {
          submissionCounts: {
            pending: 5,
            review: 10,
            approved: 20,
            rejected: 8,
            licensed: 3,
            total: 46,
          },
          aiDetection: {
            threshold: 0.7,
            autoRejectThreshold: 0.9,
            autoApproveThreshold: 0.3,
          },
          complianceSettings: {
            requireHumanReview: true,
            contentSafetyThreshold: 0.6,
            ipComplianceThreshold: 0.7,
          },
          timestamp: new Date().toISOString(),
        },
      }),
    )

    render(<ModerationDashboard />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Total Submissions")).toBeInTheDocument()
    })

    // Check that metrics are displayed
    expect(screen.getByText("46")).toBeInTheDocument() // Total submissions
    expect(screen.getByText("10")).toBeInTheDocument() // Pending review
    expect(screen.getByText("20")).toBeInTheDocument() // Approved
    expect(screen.getByText("8")).toBeInTheDocument() // Rejected

    // Check that tabs work
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("AI Settings")).toBeInTheDocument()

    // Click on AI Settings tab
    fireEvent.click(screen.getByText("AI Settings"))

    // Check that AI settings are displayed
    expect(screen.getByText("AI Detection Threshold")).toBeInTheDocument()
    expect(screen.getByText("Auto-Reject Threshold")).toBeInTheDocument()
  })

  it("should handle fetch errors", async () => {
    // Mock failed metrics response
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(500, {
        error: "Server error",
      }),
    )

    render(<ModerationDashboard />)

    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument()
    })

    expect(screen.getByText(/Failed to load moderation metrics/)).toBeInTheDocument()
    expect(screen.getByText("Try Again"))
      .toBeInTheDocument()(
        // Mock successful response for retry
        global.fetch as jest.Mock,
      )
      .mockImplementationOnce(() =>
        mockFetchResponse(200, {
          success: true,
          metrics: {
            submissionCounts: { pending: 5, review: 10, approved: 20, rejected: 8, licensed: 3, total: 46 },
            aiDetection: { threshold: 0.7, autoRejectThreshold: 0.9, autoApproveThreshold: 0.3 },
            complianceSettings: { requireHumanReview: true, contentSafetyThreshold: 0.6, ipComplianceThreshold: 0.7 },
            timestamp: new Date().toISOString(),
          },
        }),
      )

    // Click retry button
    fireEvent.click(screen.getByText("Try Again"))

    // Wait for data to load after retry
    await waitFor(() => {
      expect(screen.getByText("Total Submissions")).toBeInTheDocument()
    })

    // Check that metrics are displayed after retry
    expect(screen.getByText("46")).toBeInTheDocument()
  })

  it("should refresh data when refresh button is clicked", async () => {
    // Mock initial successful metrics response
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchResponse(200, {
        success: true,
        metrics: {
          submissionCounts: { pending: 5, review: 10, approved: 20, rejected: 8, licensed: 3, total: 46 },
          aiDetection: { threshold: 0.7, autoRejectThreshold: 0.9 },
          complianceSettings: { requireHumanReview: true, contentSafetyThreshold: 0.6 },
          timestamp: new Date().toISOString(),
        },
      }),
    )

    render(<ModerationDashboard />)

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText("46")).toBeInTheDocument() // Total submissions
    })(
      // Mock updated metrics response for refresh
      global.fetch as jest.Mock,
    ).mockImplementationOnce(() =>
      mockFetchResponse(200, {
        success: true,
        metrics: {
          submissionCounts: { pending: 6, review: 12, approved: 25, rejected: 10, licensed: 5, total: 58 },
          aiDetection: { threshold: 0.7, autoRejectThreshold: 0.9 },
          complianceSettings: { requireHumanReview: true, contentSafetyThreshold: 0.6 },
          timestamp: new Date().toISOString(),
        },
      }),
    )

    // Click refresh button
    fireEvent.click(screen.getByText("Refresh"))

    // Wait for updated data to load
    await waitFor(() => {
      expect(screen.getByText("58")).toBeInTheDocument() // Updated total submissions
    })

    // Check that updated metrics are displayed
    expect(screen.getByText("25")).toBeInTheDocument() // Updated approved count
  })
})

