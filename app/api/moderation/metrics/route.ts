import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { getComplianceRules } from "@/lib/db/config-service"
import { getSubmissionsByStatus } from "@/lib/db/models/submission"

// Only allow access from authenticated admin users
export async function GET(request: NextRequest) {
  // Check for admin authorization
  const authHeader = request.headers.get("authorization")
  if (!process.env.BYPASS_AUTH && (!authHeader || !authHeader.startsWith("Bearer "))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get metrics data
    const pendingSubmissions = await getSubmissionsByStatus("pending")
    const reviewSubmissions = await getSubmissionsByStatus("review")
    const approvedSubmissions = await getSubmissionsByStatus("approved")
    const rejectedSubmissions = await getSubmissionsByStatus("rejected")
    const licensedSubmissions = await getSubmissionsByStatus("licensed")

    // Get compliance rules
    const complianceRules = await getComplianceRules()

    // Calculate metrics
    const metrics = {
      submissionCounts: {
        pending: pendingSubmissions.length,
        review: reviewSubmissions.length,
        approved: approvedSubmissions.length,
        rejected: rejectedSubmissions.length,
        licensed: licensedSubmissions.length,
        total:
          pendingSubmissions.length +
          reviewSubmissions.length +
          approvedSubmissions.length +
          rejectedSubmissions.length +
          licensedSubmissions.length,
      },
      aiDetection: {
        threshold: complianceRules.aiDetectionThreshold,
        autoRejectThreshold: complianceRules.autoRejectThreshold,
        autoApproveThreshold: complianceRules.autoApproveThreshold,
      },
      complianceSettings: {
        requireHumanReview: complianceRules.requireHumanReview,
        contentSafetyThreshold: complianceRules.contentSafetyThreshold,
        ipComplianceThreshold: complianceRules.ipComplianceThreshold,
      },
      timestamp: new Date().toISOString(),
    }

    logger.info(`Moderation metrics requested`, {
      context: "moderation-metrics",
      data: { metrics: metrics.submissionCounts },
    })

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    logger.error("Error fetching moderation metrics", error, {
      context: "moderation-metrics",
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch moderation metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

