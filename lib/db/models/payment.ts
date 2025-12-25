import { db, DB } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { z } from 'zod';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

const CreatePaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  paymentMethod: z.string().min(2).max(50),
  paymentIntentId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * CREATE PAYMENT
 */
export async function createPayment(
  paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Payment> {
  try {
    const validatedData = CreatePaymentSchema.parse(paymentData);
    const id = uuidv4();
    const now = new Date();

    const payment: Payment = {
      id,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .insertInto('payments')
      .values({
        id: payment.id,
        user_id: payment.userId,
        amount: payment.amount.toString(), // PostgreSQL Numeric often expects string to preserve precision
        currency: payment.currency,
        status: payment.status,
        payment_method: payment.paymentMethod,
        payment_intent_id: payment.paymentIntentId ?? null,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
        metadata: JSON.stringify(payment.metadata ?? {}),
      })
      .execute();

    logger.info('Payment created successfully', {
      context: 'payment-model',
      data: { paymentId: id, userId: payment.userId },
    });

    return payment;
  } catch (error: any) {
    logger.error('Failed to create payment', { context: 'payment-model', error });
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid payment data: ${JSON.stringify(error.issues)}`);
    }
    throw error;
  }
}

/**
 * GET BY ID
 */
export async function getPaymentById(id: string): Promise<Payment | null> {
  const result = await db
    .selectFrom('payments')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return result ? mapRowToPayment(result) : null;
}

/**
 * GET BY USER ID
 */
export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const results = await db
    .selectFrom('payments')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .execute();

  return results.map(mapRowToPayment);
}

/**
 * UPDATE PAYMENT STATUS (With History Tracking)
 */
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  metadata?: Record<string, any>
): Promise<Payment | null> {
  return await db.transaction().execute(async (trx) => {
    const existingRow = await trx
      .selectFrom('payments')
      .selectAll()
      .where('id', '=', id)
      .forUpdate()
      .executeTakeFirst();

    if (!existingRow) return null;

    const currentPayment = mapRowToPayment(existingRow);
    const now = new Date();

    // Prepare metadata with status history
    const updatedMetadata = {
      ...(currentPayment.metadata ?? {}),
      ...(metadata ?? {}),
      statusHistory: [
        ...(currentPayment.metadata?.statusHistory ?? []),
        {
          from: currentPayment.status,
          to: status,
          date: now.toISOString(),
        },
      ],
    };

    await trx
      .updateTable('payments')
      .set({
        status,
        updated_at: now,
        metadata: JSON.stringify(updatedMetadata),
      })
      .where('id', '=', id)
      .execute();

    return {
      ...currentPayment,
      status,
      updatedAt: now,
      metadata: updatedMetadata,
    };
  });
}

/**
 * MAPPER
 */
function mapRowToPayment(row: any): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    status: row.status as PaymentStatus,
    paymentMethod: row.payment_method,
    paymentIntentId: row.payment_intent_id ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
  };
}
