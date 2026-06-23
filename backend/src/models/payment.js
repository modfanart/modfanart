// backend/src/models/payment.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Zod schemas — copy from frontend/validation/model-validation.js
const z = require('zod');

const PaymentStatusEnum = z.enum(['pending', 'completed', 'failed', 'refunded']);

const CreatePaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: PaymentStatusEnum.default('pending'),
  paymentMethod: z.string().min(2).max(50),
  paymentIntentId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function mapRowToPayment(row) {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentIntentId: row.payment_intent_id ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    metadata: row.metadata ?? undefined,
  };
}

// ─────────────────────────────────────────────
//              CRUD Operations
// ─────────────────────────────────────────────

async function createPayment(paymentData) {
  try {
    const validated = CreatePaymentSchema.parse(paymentData);
    const id = uuidv4();
    const now = new Date();

    const payment = {
      id,
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    await db
      .insertInto('payments')
      .values({
        id: payment.id,
        user_id: payment.userId,
        amount: payment.amount.toString(), // safe for Numeric/Decimal
        currency: payment.currency,
        status: payment.status,
        payment_method: payment.paymentMethod,
        payment_intent_id: payment.paymentIntentId ?? null,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
        metadata: payment.metadata ?? null, // object → JSONB
      })
      .execute();

    logger.info('Payment created successfully', {
      context: 'payment-model',
      data: { paymentId: id, userId: payment.userId },
    });

    return payment;
  } catch (error) {
    logger.error('Failed to create payment', {
      context: 'payment-model',
      error: error.message || error,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid payment data: ${JSON.stringify(error.issues)}`);
    }

    throw error;
  }
}

async function getPaymentById(id) {
  const result = await db
    .selectFrom('payments')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return result ? mapRowToPayment(result) : null;
}

async function getPaymentsByUserId(userId) {
  const results = await db
    .selectFrom('payments')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc')
    .execute();

  return results.map(mapRowToPayment);
}

async function updatePaymentStatus(id, status, metadata = {}) {
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

    const currentHistory = (currentPayment.metadata?.statusHistory || []);

    const updatedMetadata = {
      ...currentPayment.metadata,
      ...metadata,
      statusHistory: [
        ...currentHistory,
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
        metadata: updatedMetadata, // object → JSONB
      })
      .where('id', '=', id)
      .execute();

    const updated = {
      ...currentPayment,
      status,
      updatedAt: now,
      metadata: updatedMetadata,
    };

    logger.info('Payment status updated', {
      paymentId: id,
      from: currentPayment.status,
      to: status,
    });

    return updated;
  });
}

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByUserId,
  updatePaymentStatus,
};