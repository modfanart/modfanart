// src/models/orderItem.model.js
const { db } = require('../../../config'); // ← only db
const { sql } = require('kysely'); // ← ADD THIS LINE

class OrderItem {
  static async create(orderId, data, trx = db) {
    return trx
      .insertInto('order_items')
      .values({
        order_id: orderId,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(id, trx = db) {
    return trx
      .selectFrom('order_items')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async findByOrderId(orderId, trx = db) {
    return trx
      .selectFrom('order_items')
      .selectAll()
      .where('order_id', '=', orderId)
      .execute();
  }

  // Useful for invoice / receipt generation
  static async getWithArtwork(orderId) {
    return db
      .selectFrom('order_items')
      .innerJoin('artworks', 'artworks.id', 'order_items.artwork_id')
      .select([
        'order_items.*',
        'artworks.title',
        'artworks.thumbnail_url',
        'artworks.creator_id',
      ])
      .where('order_items.order_id', '=', orderId)
      .execute();
  }
}

module.exports = OrderItem;
