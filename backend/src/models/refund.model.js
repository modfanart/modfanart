// src/models/refund.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class Refund {
  static async create(orderId, amountCents, reason) {
    return db
      .insertInto('refunds')
      .values({
        order_id: orderId,
        amount_cents: amountCents,
        reason,
        status: 'requested',
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(id) {
    return db
      .selectFrom('refunds')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async process(id, stripeRefundId, approverId) {
    return db
      .updateTable('refunds')
      .set({
        status: 'processed',
        stripe_refund_id: stripeRefundId,
        approved_by: approverId,
        processed_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static async getForOrder(orderId) {
    return db
      .selectFrom('refunds')
      .selectAll()
      .where('order_id', '=', orderId)
      .orderBy('created_at', 'desc')
      .execute();
  }
}

module.exports = Refund;