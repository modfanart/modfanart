import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { requireAuth } from "@/lib/middleware/auth"
import { createSanitizedStringSchema, sanitizeAndValidate } from "@/lib/utils/sanitize"

// Define validation schema for license terms with sanitization
const LicenseTermsSchema = z.object({
  duration: createSanitizedStringSchema({ min: 1, max: 100, errorMessage: "Duration is required" }),
  territory: createSanitizedStringSchema({ min: 1, max: 100, errorMessage: "Territory is required" }),
  exclusivity: z.boolean(),
  royaltyRate: z.number().min(0).max(100).optional(),
  restrictions: z.array(createSanitizedStringSchema({ max: 500 })).optional(),
})

// Define validation schema for license creation
const CreateLicenseSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  artistId: z.string().min(1, "Artist ID is required"),
  brandId: z.string().min(1, "Brand ID is required"),
  licenseType: z.enum(["personal", "commercial", "full"], {
    errorMap: () => ({ message: "License type must be personal, commercial, or full" }),
  }),
  terms: LicenseTermsSchema.optional(),
})

export interface LicenseAgreement {
  id: string
  submissionId: string
  artistId: string
  brandId: string
  licenseType: "personal" | "commercial" | "full"
  terms: {
    duration: string
    territory: string
    exclusivity: boolean
    royaltyRate?: number
    restrictions: string[]
  }
  status: "draft" | "pending" | "active" | "expired"
  createdAt: string
  updatedAt: string
}

// Rate limit options for licensing API
const licensingRateLimitOptions = {
  limit: 30, // 30 requests
  windowMs: 60 * 1000, // per minute
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  logger.info(`License creation request received`, {
    context: "licensing-api",
    requestId,
    timestamp: new Date().toISOString(),
  })

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(licensingRateLimitOptions)(req)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Apply authentication - require user to be logged in
    const authResult = await requireAuth(req)
    if (authResult) {
      return authResult
    }

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      logger.warn("Failed to parse request body", {
        context: "licensing-api",
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          requestId,
        },
        { status: 400 },
      )
    }

    // Validate and sanitize input using Zod
    const validation = sanitizeAndValidate(body, CreateLicenseSchema, "licensing-api")
    if (!validation.success) {
      logger.warn("Invalid license data", {
        context: "licensing-api",
        requestId,
        errors: validation.errors?.errors,
        body: JSON.stringify(body).substring(0, 200) + "...", // Log partial body for debugging
      })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid license data",
          details: validation.errors?.errors,
          requestId,
        },
        { status: 400 },
      )
    }

    const { submissionId, artistId, brandId, licenseType, terms } = validation.data

    // Get the authenticated user
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userRole = session?.user?.role || "user"

    // Log the license creation attempt
    logger.info(`Creating license agreement`, {
      context: "licensing-api",
      requestId,
      data: {
        licenseType,
        submissionId,
        artistId,
        brandId,
        userId,
        userRole,
      },
    })

    // Check if user has permission to create this license
    // In a real app, you would check if the user is the brand owner or has admin rights
    const hasPermission = userRole === "admin" || userId === brandId || (userRole === "brand" && userId === brandId)

    if (!hasPermission) {
      logger.warn(`Permission denied for license creation`, {
        context: "licensing-api",
        requestId,
        data: {
          userId,
          userRole,
          brandId,
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to create licenses for this brand",
          requestId,
        },
        { status: 403 },
      )
    }

    // Simulate creating a license agreement
    const licenseAgreement: LicenseAgreement = {
      id: `LICENSE-${Math.floor(Math.random() * 10000)}`,
      submissionId,
      artistId,
      brandId,
      licenseType,
      terms: terms || {
        duration: "1 year",
        territory: "Worldwide",
        exclusivity: false,
        restrictions: ["No modifications allowed", "Attribution required"],
      },
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Log successful creation
    logger.info(`License agreement created successfully`, {
      context: "licensing-api",
      requestId,
      data: {
        licenseId: licenseAgreement.id,
        processingTime: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      success: true,
      licenseAgreement,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log detailed error for debugging but don't expose stack traces to client
    logger.error("Error creating license agreement", {
      context: "licensing-api",
      requestId,
      data: {
        error: errorMessage,
        stack: errorStack,
        processingTime: Date.now() - startTime,
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create license agreement",
        message: errorMessage,
        meta: {
          requestId,
          processingTime: Date.now() - startTime,
        },
      },
      { status: 500 },
    )
  }
}

