// src/models/order.model.js
const { db } = require('../../../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class Order {
  static async create(data, trx = db) {
    return trx
      .insertInto('orders')
      .values({
        ...data,
        created_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(id, trx = db) {
    return trx
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async markAsPaid(id, stripeIntentId, stripeChargeId, trx = db) {
    return trx
      .updateTable('orders')
      .set({
        status: 'paid',
        stripe_payment_intent_id: stripeIntentId,
        stripe_charge_id: stripeChargeId,
        paid_at: sql`NOW()`,
        updated_at: sql`NOW()`,
      })
      .where('id', '=', id)
      .execute();
  }
}

module.exports = Order;
