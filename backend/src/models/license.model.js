// src/models/license.model.js
const { db } = require('../config');           // ← only db
const { sql } = require('kysely');             // ← ADD THIS LINE

class License {
  static async issue(orderItemId, artworkId, buyerId, sellerId, licenseType, contractPdfUrl, expiresAt = null) {
    return db
      .insertInto('licenses')
      .values({
        order_item_id: orderItemId,
        artwork_id: artworkId,
        buyer_id: buyerId,
        seller_id: sellerId,
        license_type: licenseType,
        contract_pdf_url: contractPdfUrl,
        expires_at: expiresAt,
        is_active: true,
        created_at: sql`NOW()`,
      })
      .returningAll()
      .executeTakeFirst();
  }

  static async findById(id) {
    return db
      .selectFrom('licenses')
      .selectAll()
      .where('id', '=', id)
      .where('is_active', '=', true)
      .where((eb) => eb.or([
        eb('expires_at', 'is', null),
        eb('expires_at', '>', sql`NOW()`),
      ]))
      .executeTakeFirst();
  }

  static async revoke(id, reason = null) {
    return db
      .updateTable('licenses')
      .set({
        is_active: false,
        revoked_at: sql`NOW()`,
        // you could add a revocation_reason column if needed
      })
      .where('id', '=', id)
      .execute();
  }

  static async getLicensesForBuyer(buyerId, limit = 20, offset = 0) {
    return db
      .selectFrom('licenses')
      .innerJoin('artworks', 'artworks.id', 'licenses.artwork_id')
      .select([
        'licenses.*',
        'artworks.title',
        'artworks.thumbnail_url',
      ])
      .where('licenses.buyer_id', '=', buyerId)
      .where('licenses.is_active', '=', true)
      .orderBy('licenses.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  }
}

module.exports = License;