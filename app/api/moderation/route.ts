import { type NextRequest, NextResponse } from "next/server"
import { createSubmission } from "@/lib/db/models/submission"
import { getUserById } from "@/lib/db/models/user"
import { logger } from "@/lib/logger"
import { z } from "zod"
import { validateRequest } from "@/lib/validation"
import { analyzeSubmission } from "@/lib/services/moderation-service"

// Schema for request validation
const moderationRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  originalIp: z.string().min(1, "Original IP is required"),
  tags: z.union([z.string(), z.array(z.string())]),
  imageUrl: z.string().url("Valid image URL is required"),
  licenseType: z.string().min(1, "License type is required"),
  userId: z.string().min(1, "User ID is required"),
})

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  logger.info(`Moderation request received`, {
    context: "moderation-api",
    data: { requestId },
  })

  try {
    // Validate request body
    const body = await request.json()
    const validation = validateRequest(moderationRequestSchema, body, "moderation-request")

    if (!validation.success) {
      return validation.response
    }

    const { title, description, category, originalIp, tags, imageUrl, licenseType, userId } = validation.data

    // Verify user exists
    const user = await getUserById(userId)
    if (!user) {
      logger.warn(`User not found: ${userId}`, {
        context: "moderation-api",
        data: { requestId, userId },
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Analyze submission using AI services
    const analysis = await analyzeSubmission(title, description, category, originalIp, tags, imageUrl)

    // Create a submission record
    const submission = await createSubmission({
      title,
      description,
      category,
      originalIp,
      tags: typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()) : tags,
      status: analysis.finalRecommendation === "approve" ? "pending" : "review",
      imageUrl,
      licenseType,
      userId,
      analysis,
    })

    const duration = Date.now() - startTime
    logger.info(`Moderation request completed successfully`, {
      context: "moderation-api",
      data: {
        requestId,
        duration,
        submissionId: submission.id,
        recommendation: analysis.finalRecommendation,
        needsHumanReview: analysis.needsHumanReview,
      },
    })

    return NextResponse.json({
      success: true,
      analysis,
      submission,
      requestId,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error("Error in moderation API", error, {
      context: "moderation-api",
      data: { requestId, duration },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process submission",
        details: error instanceof Error ? error.message : String(error),
        requestId,
      },
      { status: 500 },
    )
  }
}

