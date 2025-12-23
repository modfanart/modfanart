/**
 * This file demonstrates how to use all the integrations together
 * in a typical submission workflow.
 */

import { uploadFile } from "@/lib/db/storage"
import { analyzeSubmissionContent, generateImageTags } from "@/lib/ai/grok-client"
import { trackSubmission, trackUserActivity } from "@/lib/db/motherduck"
import { getFeatureFlag, shouldAutoApprove, shouldAutoReject } from "@/lib/edge-config"
import { logger } from "@/lib/logger"

/**
 * Process a new submission
 */
export async function processSubmission(params: {
  userId: string
  title: string
  description: string
  category: string
  originalIp: string
  file: File
}): Promise<{
  success: boolean
  submissionId: string
  status: "approved" | "rejected" | "pending"
  imageUrl?: string
  analysis?: any
  error?: string
}> {
  const { userId, title, description, category, originalIp, file } = params
  const submissionId = crypto.randomUUID()

  try {
    logger.info(`Processing new submission: ${title}`, {
      context: "submission-workflow",
      submissionId,
      userId,
      category,
    })

    // Step 1: Upload the file to Blob Store
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await uploadFile(buffer, {
      filename: file.name,
      contentType: file.type,
      folder: `submissions/${userId}`,
    })

    logger.info(`File uploaded successfully: ${uploadResult.pathname}`, {
      context: "submission-workflow",
      submissionId,
    })

    // Step 2: Check if AI moderation is enabled
    const isAiModerationEnabled = await getFeatureFlag("enableAiModeration")

    let analysis = null
    let aiScore = 0
    let ipComplianceScore = 5 // Default middle score
    let contentSafetyScore = 5 // Default middle score
    let overallRiskScore = 5 // Default middle score

    if (isAiModerationEnabled) {
      // Step 3: Analyze the submission with GrokAi
      analysis = await analyzeSubmissionContent({
        title,
        description,
        category,
        originalIp,
        imageUrl: uploadResult.url,
      })

      // Generate tags
      const tags = await generateImageTags(uploadResult.url, category)

      // Calculate scores based on analysis
      aiScore = analysis.confidenceScore / 100
      ipComplianceScore = analysis.isAppropriate ? 3 : 8
      contentSafetyScore = analysis.isAppropriate ? 3 : 7
      overallRiskScore = analysis.isAppropriate ? 3 : 8

      logger.info(`Submission analyzed: ${analysis.isAppropriate ? "Appropriate" : "Inappropriate"}`, {
        context: "submission-workflow",
        submissionId,
        aiScore,
        ipComplianceScore,
        contentSafetyScore,
        overallRiskScore,
      })
    }

    // Step 4: Determine submission status
    let status: "approved" | "rejected" | "pending" = "pending"

    // Check if auto-approval is enabled
    const isAutoApprovalEnabled = await getFeatureFlag("enableAutoApproval")

    if (isAutoApprovalEnabled) {
      // Check if submission should be auto-approved or auto-rejected
      const scores = {
        aiScore,
        ipComplianceScore,
        contentSafetyScore,
        overallRiskScore,
      }

      if (await shouldAutoReject(scores)) {
        status = "rejected"
        logger.info(`Submission auto-rejected`, {
          context: "submission-workflow",
          submissionId,
          scores,
        })
      } else if (await shouldAutoApprove(scores)) {
        status = "approved"
        logger.info(`Submission auto-approved`, {
          context: "submission-workflow",
          submissionId,
          scores,
        })
      } else {
        status = "pending"
        logger.info(`Submission needs manual review`, {
          context: "submission-workflow",
          submissionId,
          scores,
        })
      }
    }

    // Step 5: Track submission in MotherDuck analytics
    const isAnalyticsEnabled = await getFeatureFlag("enableAnalytics")

    if (isAnalyticsEnabled) {
      await trackSubmission({
        id: submissionId,
        title,
        category,
        originalIp,
        createdAt: new Date(),
        status,
        aiScore,
        ipComplianceScore,
        contentSafetyScore,
        overallRiskScore,
      })

      // Track user activity
      await trackUserActivity({
        userId,
        actionType: "submission_create",
        resourceType: "submission",
        resourceId: submissionId,
        metadata: {
          title,
          category,
          originalIp,
          status,
        },
      })

      logger.info(`Submission tracked in analytics`, {
        context: "submission-workflow",
        submissionId,
      })
    }

    // Return the result
    return {
      success: true,
      submissionId,
      status,
      imageUrl: uploadResult.url,
      analysis: analysis
        ? {
            isAppropriate: analysis.isAppropriate,
            confidenceScore: analysis.confidenceScore,
            reasoning: analysis.reasoning,
            suggestedTags: analysis.suggestedTags,
          }
        : undefined,
    }
  } catch (error) {
    logger.error(`Error processing submission: ${(error as Error).message}`, error, {
      context: "submission-workflow",
      submissionId,
    })

    return {
      success: false,
      submissionId,
      status: "pending",
      error: `Failed to process submission: ${(error as Error).message}`,
    }
  }
}

