import { postgresClient, DB, s3Client } from "../config"
import { v4 as uuidv4 } from "uuid"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { CreateSubmissionSchema, UpdateSubmissionSchema, validateModel } from "../../validation/model-validation"
import { logger } from "../../utils/logger"
import { sanitizeFilename } from "../../validation/file-validation"

export type SubmissionStatus = "pending" | "review" | "approved" | "rejected" | "licensed"

export interface AIAnalysis {
  aiDetection: {
    score: number
    isAiGenerated: boolean
    confidence: number
    humanVerified: boolean
  }
  contentAnalysis: {
    ipCompliance: {
      score: number
      issues: string[]
      riskLevel: "low" | "medium" | "high"
    }
    contentSafety: {
      score: number
      issues: string[]
      riskLevel: "low" | "medium" | "high"
    }
    brandGuidelines: {
      adherence: "low" | "medium" | "high"
      issues: string[]
      notes: string
    }
    overallRiskScore: number
    recommendation: "approve" | "reject" | "review"
    reasoningSummary: string
  }
  finalRecommendation: "approve" | "reject" | "review"
  needsHumanReview: boolean
}

export interface Submission {
  id: string
  title: string
  description: string
  category: string
  originalIp: string
  tags: string[]
  status: SubmissionStatus
  imageUrl: string
  licenseType: string
  submittedAt: Date
  updatedAt: Date
  userId: string
  analysis?: AIAnalysis
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: Date
}

export async function createSubmission(
  submissionData: Omit<Submission, "id" | "submittedAt" | "updatedAt">,
  imageFile?: Buffer,
): Promise<Submission> {
  // Validate input data
  const validation = validateModel(submissionData, CreateSubmissionSchema, "createSubmission")
  if (!validation.success) {
    throw new Error(`Invalid submission data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  const id = uuidv4()
  const now = new Date()

  let imageUrl = submissionData.imageUrl

  // If image file is provided, upload to S3
  if (imageFile) {
    try {
      const sanitizedTitle = sanitizeFilename(submissionData.title)
      const key = `submissions/${id}/${sanitizedTitle}.jpg`

      await s3Client.send(
        new PutObjectCommand({
          Bucket: "bbdx-mod-fan-art",
          Key: key,
          Body: imageFile,
          ContentType: "image/jpeg",
        }),
      )

      imageUrl = `https://bbdx-mod-fan-art.s3.amazonaws.com/${key}`

      logger.info("Image uploaded successfully", {
        context: "submission-model",
        data: { submissionId: id, imageKey: key },
      })
    } catch (error) {
      logger.error("Failed to upload image", {
        context: "submission-model",
        error,
        data: { submissionId: id },
      })
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  const submission: Submission = {
    id,
    ...submissionData,
    imageUrl,
    submittedAt: now,
    updatedAt: now,
  }

  try {
    await postgresClient.sql`
      INSERT INTO ${DB.SUBMISSIONS} (
        id, title, description, category, original_ip, tags, 
        status, image_url, license_type, submitted_at, updated_at, 
        user_id, analysis, review_notes, reviewed_by, reviewed_at
      ) VALUES (
        ${submission.id}, ${submission.title}, ${submission.description}, 
        ${submission.category}, ${submission.originalIp}, ${JSON.stringify(submission.tags)}, 
        ${submission.status}, ${submission.imageUrl}, ${submission.licenseType}, 
        ${submission.submittedAt}, ${submission.updatedAt}, ${submission.userId}, 
        ${JSON.stringify(submission.analysis || null)}, ${submission.reviewNotes || null}, 
        ${submission.reviewedBy || null}, ${submission.reviewedAt || null}
      )
    `

    logger.info("Submission created successfully", {
      context: "submission-model",
      data: { submissionId: id, userId: submission.userId },
    })

    return submission
  } catch (error) {
    logger.error("Failed to create submission", {
      context: "submission-model",
      error,
      data: { userId: submission.userId },
    })
    throw new Error(`Failed to create submission: ${error.message}`)
  }
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid submission ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.SUBMISSIONS} WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToSubmission(result.rows[0])
  } catch (error) {
    logger.error("Failed to get submission by ID", {
      context: "submission-model",
      error,
      data: { submissionId: id },
    })
    throw new Error(`Failed to get submission: ${error.message}`)
  }
}

export async function getSubmissionsByUserId(userId: string): Promise<Submission[]> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.SUBMISSIONS} WHERE user_id = ${userId} ORDER BY submitted_at DESC
    `

    return result.rows.map(mapRowToSubmission)
  } catch (error) {
    logger.error("Failed to get submissions by user ID", {
      context: "submission-model",
      error,
      data: { userId },
    })
    throw new Error(`Failed to get submissions: ${error.message}`)
  }
}

export async function getSubmissionsByStatus(status: SubmissionStatus): Promise<Submission[]> {
  if (!status || typeof status !== "string") {
    throw new Error("Invalid status")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.SUBMISSIONS} WHERE status = ${status} ORDER BY submitted_at DESC
    `

    return result.rows.map(mapRowToSubmission)
  } catch (error) {
    logger.error("Failed to get submissions by status", {
      context: "submission-model",
      error,
      data: { status },
    })
    throw new Error(`Failed to get submissions: ${error.message}`)
  }
}

export async function updateSubmission(id: string, submissionData: Partial<Submission>): Promise<Submission | null> {
  // Validate input data
  const validation = validateModel(submissionData, UpdateSubmissionSchema, "updateSubmission")
  if (!validation.success) {
    throw new Error(`Invalid submission data: ${JSON.stringify(validation.errors?.errors)}`)
  }

  try {
    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Get current submission data
      const getSubmissionResult = await client.sql`
        SELECT * FROM ${DB.SUBMISSIONS} WHERE id = ${id} FOR UPDATE
      `

      if (getSubmissionResult.rows.length === 0) {
        await client.sql`ROLLBACK`
        return null
      }

      const currentSubmission = mapRowToSubmission(getSubmissionResult.rows[0])

      const updatedSubmission = {
        ...currentSubmission,
        ...submissionData,
        updatedAt: new Date(),
      }

      await client.sql`
        UPDATE ${DB.SUBMISSIONS} SET
          title = ${updatedSubmission.title},
          description = ${updatedSubmission.description},
          category = ${updatedSubmission.category},
          original_ip = ${updatedSubmission.originalIp},
          tags = ${JSON.stringify(updatedSubmission.tags)},
          status = ${updatedSubmission.status},
          image_url = ${updatedSubmission.imageUrl},
          license_type = ${updatedSubmission.licenseType},
          updated_at = ${updatedSubmission.updatedAt},
          analysis = ${JSON.stringify(updatedSubmission.analysis || null)},
          review_notes = ${updatedSubmission.reviewNotes || null},
          reviewed_by = ${updatedSubmission.reviewedBy || null},
          reviewed_at = ${updatedSubmission.reviewedAt || null}
        WHERE id = ${id}
      `

      await client.sql`COMMIT`

      logger.info("Submission updated successfully", {
        context: "submission-model",
        data: { submissionId: id },
      })

      return updatedSubmission
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to update submission", {
      context: "submission-model",
      error,
      data: { submissionId: id },
    })
    throw new Error(`Failed to update submission: ${error.message}`)
  }
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid submission ID")
  }

  try {
    const result = await postgresClient.sql`
      DELETE FROM ${DB.SUBMISSIONS} WHERE id = ${id}
    `

    const deleted = result.rowCount > 0

    if (deleted) {
      logger.info("Submission deleted successfully", {
        context: "submission-model",
        data: { submissionId: id },
      })
    } else {
      logger.warn("Submission not found for deletion", {
        context: "submission-model",
        data: { submissionId: id },
      })
    }

    return deleted
  } catch (error) {
    logger.error("Failed to delete submission", {
      context: "submission-model",
      error,
      data: { submissionId: id },
    })
    throw new Error(`Failed to delete submission: ${error.message}`)
  }
}

function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    originalIp: row.original_ip,
    tags: row.tags,
    status: row.status,
    imageUrl: row.image_url,
    licenseType: row.license_type,
    submittedAt: new Date(row.submitted_at),
    updatedAt: new Date(row.updated_at),
    userId: row.user_id,
    analysis: row.analysis,
    reviewNotes: row.review_notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
  }
}

