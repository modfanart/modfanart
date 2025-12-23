import { postgresClient, DB } from "../config"
import { v4 as uuidv4 } from "uuid"
import { logger } from "../../utils/logger"
import { z } from "zod"

export type LicenseStatus = "active" | "expired" | "revoked"

const LicenseTermsSchema = z.object({
  usageRights: z.array(z.string()),
  territories: z.array(z.string()),
  duration: z.number().int().positive(),
  restrictions: z.array(z.string()).optional(),
  royaltyPercentage: z.number().min(0).max(100).optional(),
  exclusivity: z.boolean().default(false),
})

export type LicenseTerms = z.infer<typeof LicenseTermsSchema>

const CreateLicenseSchema = z.object({
  submissionId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseType: z.string().min(2).max(50),
  status: z.enum(["active", "expired", "revoked"]).default("active"),
  terms: LicenseTermsSchema,
  expiresAt: z.date().optional(),
  paymentId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
})

export interface License {
  id: string
  submissionId: string
  userId: string
  licenseType: string
  status: LicenseStatus
  terms: LicenseTerms
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  paymentId?: string
  metadata?: Record<string, any>
}

export async function createLicense(licenseData: Omit<License, "id" | "createdAt" | "updatedAt">): Promise<License> {
  try {
    // Validate input data
    const validatedData = CreateLicenseSchema.parse(licenseData)

    const id = uuidv4()
    const now = new Date()

    const license: License = {
      id,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    }

    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Verify submission exists and is in approved status
      const submissionResult = await client.sql`
        SELECT status FROM ${DB.SUBMISSIONS} 
        WHERE id = ${license.submissionId}
        FOR UPDATE
      `

      if (submissionResult.rows.length === 0) {
        throw new Error(`Submission with ID ${license.submissionId} not found`)
      }

      const submissionStatus = submissionResult.rows[0].status
      if (submissionStatus !== "approved") {
        throw new Error(`Cannot license submission with status ${submissionStatus}`)
      }

      // Insert license record
      await client.sql`
        INSERT INTO ${DB.LICENSES} (
          id, submission_id, user_id, license_type, status, 
          terms, created_at, updated_at, expires_at, payment_id, metadata
        ) VALUES (
          ${license.id}, ${license.submissionId}, ${license.userId}, 
          ${license.licenseType}, ${license.status}, ${JSON.stringify(license.terms)}, 
          ${license.createdAt}, ${license.updatedAt}, ${license.expiresAt || null}, 
          ${license.paymentId || null}, ${JSON.stringify(license.metadata || {})}
        )
      `

      // Update submission status to licensed
      await client.sql`
        UPDATE ${DB.SUBMISSIONS} 
        SET status = 'licensed', updated_at = ${now}
        WHERE id = ${license.submissionId}
      `

      await client.sql`COMMIT`

      logger.info("License created successfully", {
        context: "license-model",
        data: { licenseId: id, submissionId: license.submissionId, userId: license.userId },
      })

      return license
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to create license", {
      context: "license-model",
      error,
      data: { submissionId: licenseData.submissionId, userId: licenseData.userId },
    })

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid license data: ${JSON.stringify(error.errors)}`)
    }

    throw new Error(`Failed to create license: ${error.message}`)
  }
}

export async function getLicenseById(id: string): Promise<License | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid license ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.LICENSES} WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToLicense(result.rows[0])
  } catch (error) {
    logger.error("Failed to get license by ID", {
      context: "license-model",
      error,
      data: { licenseId: id },
    })
    throw new Error(`Failed to get license: ${error.message}`)
  }
}

export async function getLicensesByUserId(userId: string): Promise<License[]> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.LICENSES} WHERE user_id = ${userId} ORDER BY created_at DESC
    `

    return result.rows.map(mapRowToLicense)
  } catch (error) {
    logger.error("Failed to get licenses by user ID", {
      context: "license-model",
      error,
      data: { userId },
    })
    throw new Error(`Failed to get licenses: ${error.message}`)
  }
}

export async function getLicensesBySubmissionId(submissionId: string): Promise<License[]> {
  if (!submissionId || typeof submissionId !== "string") {
    throw new Error("Invalid submission ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.LICENSES} WHERE submission_id = ${submissionId} ORDER BY created_at DESC
    `

    return result.rows.map(mapRowToLicense)
  } catch (error) {
    logger.error("Failed to get licenses by submission ID", {
      context: "license-model",
      error,
      data: { submissionId },
    })
    throw new Error(`Failed to get licenses: ${error.message}`)
  }
}

export async function updateLicenseStatus(id: string, status: LicenseStatus, reason?: string): Promise<License | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid license ID")
  }

  try {
    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Get current license data
      const getLicenseResult = await client.sql`
        SELECT * FROM ${DB.LICENSES} WHERE id = ${id} FOR UPDATE
      `

      if (getLicenseResult.rows.length === 0) {
        await client.sql`ROLLBACK`
        return null
      }

      const currentLicense = mapRowToLicense(getLicenseResult.rows[0])
      const now = new Date()

      // Update license status
      await client.sql`
        UPDATE ${DB.LICENSES} SET
          status = ${status},
          updated_at = ${now},
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{statusHistory}',
            COALESCE(metadata->'statusHistory', '[]'::jsonb) || 
            jsonb_build_object(
              'from', ${currentLicense.status},
              'to', ${status},
              'date', ${now.toISOString()},
              'reason', ${reason || null}
            )::jsonb
          )
        WHERE id = ${id}
      `

      // If revoking, update submission status back to approved
      if (status === "revoked") {
        await client.sql`
          UPDATE ${DB.SUBMISSIONS} 
          SET status = 'approved', updated_at = ${now}
          WHERE id = ${currentLicense.submissionId}
        `
      }

      await client.sql`COMMIT`

      logger.info(`License status updated to ${status}`, {
        context: "license-model",
        data: { licenseId: id, previousStatus: currentLicense.status, newStatus: status, reason },
      })

      // Get updated license
      const updatedLicense = await getLicenseById(id)
      return updatedLicense
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to update license status", {
      context: "license-model",
      error,
      data: { licenseId: id, status },
    })
    throw new Error(`Failed to update license status: ${error.message}`)
  }
}

function mapRowToLicense(row: any): License {
  return {
    id: row.id,
    submissionId: row.submission_id,
    userId: row.user_id,
    licenseType: row.license_type,
    status: row.status,
    terms: row.terms,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    paymentId: row.payment_id,
    metadata: row.metadata,
  }
}

