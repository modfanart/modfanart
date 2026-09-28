const { db } = require('../../../config');

// Resolves the most specific active rule for a line item:
//   1. exact (fulfillment_type, base_product_type) match
//   2. (fulfillment_type, NULL) wildcard for that fulfillment type
//   3. (NULL, NULL) default — used for digital licenses
// This mirrors how the seed data in the migration is shaped.
async function findRule(fulfillmentType, baseProductType, trx = db) {
  if (fulfillmentType && baseProductType) {
    const exact = await trx
      .selectFrom('platform_fee_rules')
      .selectAll()
      .where('fulfillment_type', '=', fulfillmentType)
      .where('base_product_type', '=', baseProductType)
      .where('is_active', '=', true)
      .executeTakeFirst();

    if (exact) return exact;
  }

  if (fulfillmentType) {
    const wildcard = await trx
      .selectFrom('platform_fee_rules')
      .selectAll()
      .where('fulfillment_type', '=', fulfillmentType)
      .where('base_product_type', 'is', null)
      .where('is_active', '=', true)
      .executeTakeFirst();

    if (wildcard) return wildcard;
  }

  return trx
    .selectFrom('platform_fee_rules')
    .selectAll()
    .where('fulfillment_type', 'is', null)
    .where('base_product_type', 'is', null)
    .where('is_active', '=', true)
    .executeTakeFirst();
}

module.exports = { findRule };
