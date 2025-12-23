import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { analyzeSubmission } from "@/lib/services/moderation-service"

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Endpoint not available in production" }, { status: 404 })
  }

  const requestId = crypto.randomUUID()
  logger.info(`Test moderation request received`, {
    context: "test-moderation-api",
    data: { requestId },
  })

  try {
    const body = await request.json()
    const { title, description, category, originalIp, tags, imageUrl } = body

    // Analyze submission using AI services
    const analysis = await analyzeSubmission(title, description, category, originalIp, tags, imageUrl)

    return NextResponse.json({
      success: true,
      analysis,
      requestId,
    })
  } catch (error) {
    logger.error("Error in test moderation API", error, {
      context: "test-moderation-api",
      data: { requestId },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process test submission",
        details: error instanceof Error ? error.message : String(error),
        requestId,
      },
      { status: 500 },
    )
  }
}

