import { postgresClient, DB } from "../config"
import { v4 as uuidv4 } from "uuid"
import { logger } from "../../utils/logger"
import { z } from "zod"

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

const CreatePaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  paymentMethod: z.string().min(2).max(50),
  paymentIntentId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: string
  paymentIntentId?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export async function createPayment(paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
  try {
    // Validate input data
    const validatedData = CreatePaymentSchema.parse(paymentData)

    const id = uuidv4()
    const now = new Date()

    const payment: Payment = {
      id,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    }

    await postgresClient.sql`
      INSERT INTO ${DB.PAYMENTS} (
        id, user_id, amount, currency, status, 
        payment_method, payment_intent_id, created_at, updated_at, metadata
      ) VALUES (
        ${payment.id}, ${payment.userId}, ${payment.amount}, 
        ${payment.currency}, ${payment.status}, ${payment.paymentMethod}, 
        ${payment.paymentIntentId || null}, ${payment.createdAt}, 
        ${payment.updatedAt}, ${JSON.stringify(payment.metadata || {})}
      )
    `

    logger.info("Payment created successfully", {
      context: "payment-model",
      data: { paymentId: id, userId: payment.userId, amount: payment.amount, currency: payment.currency },
    })

    return payment
  } catch (error) {
    logger.error("Failed to create payment", {
      context: "payment-model",
      error,
      data: { userId: paymentData.userId, amount: paymentData.amount },
    })

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid payment data: ${JSON.stringify(error.errors)}`)
    }

    throw new Error(`Failed to create payment: ${error.message}`)
  }
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid payment ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PAYMENTS} WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToPayment(result.rows[0])
  } catch (error) {
    logger.error("Failed to get payment by ID", {
      context: "payment-model",
      error,
      data: { paymentId: id },
    })
    throw new Error(`Failed to get payment: ${error.message}`)
  }
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID")
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.PAYMENTS} WHERE user_id = ${userId} ORDER BY created_at DESC
    `

    return result.rows.map(mapRowToPayment)
  } catch (error) {
    logger.error("Failed to get payments by user ID", {
      context: "payment-model",
      error,
      data: { userId },
    })
    throw new Error(`Failed to get payments: ${error.message}`)
  }
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  metadata?: Record<string, any>,
): Promise<Payment | null> {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid payment ID")
  }

  try {
    // Start transaction
    const client = await postgresClient.connect()

    try {
      await client.sql`BEGIN`

      // Get current payment data
      const getPaymentResult = await client.sql`
        SELECT * FROM ${DB.PAYMENTS} WHERE id = ${id} FOR UPDATE
      `

      if (getPaymentResult.rows.length === 0) {
        await client.sql`ROLLBACK`
        return null
      }

      const currentPayment = mapRowToPayment(getPaymentResult.rows[0])
      const now = new Date()

      // Update payment status
      let updatedMetadata = currentPayment.metadata || {}

      // Add status history
      if (!updatedMetadata.statusHistory) {
        updatedMetadata.statusHistory = []
      }

      updatedMetadata.statusHistory.push({
        from: currentPayment.status,
        to: status,
        date: now.toISOString(),
      })

      // Merge additional metadata if provided
      if (metadata) {
        updatedMetadata = { ...updatedMetadata, ...metadata }
      }

      await client.sql`
        UPDATE ${DB.PAYMENTS} SET
          status = ${status},
          updated_at = ${now},
          metadata = ${JSON.stringify(updatedMetadata)}
        WHERE id = ${id}
      `

      await client.sql`COMMIT`

      logger.info(`Payment status updated to ${status}`, {
        context: "payment-model",
        data: { paymentId: id, previousStatus: currentPayment.status, newStatus: status },
      })

      // Get updated payment
      const updatedPayment = await getPaymentById(id)
      return updatedPayment
    } catch (error) {
      await client.sql`ROLLBACK`
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    logger.error("Failed to update payment status", {
      context: "payment-model",
      error,
      data: { paymentId: id, status },
    })
    throw new Error(`Failed to update payment status: ${error.message}`)
  }
}

function mapRowToPayment(row: any): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentIntentId: row.payment_intent_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    metadata: row.metadata,
  }
}

