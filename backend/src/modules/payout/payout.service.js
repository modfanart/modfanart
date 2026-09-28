const { db } = require('../../config');
const model = require('./models/payout.model');
const feeRuleModel = require('./models/platformFeeRule.model');
const orderItemModel = require('../licenses/models/orderItem.model');

// Basis points -> cents, rounded down so the platform never takes more than
// the configured rate.
function applyFeeBps(grossCents, feeBps) {
  return Math.floor((grossCents * feeBps) / 10000);
}

function calculatePayout(grossCents, platformFeeCents) {
  if (grossCents < 0) {
    throw new Error('Gross amount cannot be negative');
  }

  if (platformFeeCents < 0) {
    throw new Error('Platform fee cannot be negative');
  }

  if (platformFeeCents > grossCents) {
    throw new Error('Platform fee cannot exceed gross amount');
  }

  return {
    gross_cents: grossCents,
    platform_fee_cents: platformFeeCents,
    net_cents: grossCents - platformFeeCents,
  };
}

// Previously this trusted `gross_cents` / `platform_fee_cents` straight from
// the request body — a seller (or anyone hitting the endpoint) could set
// their own fee to zero. The fee is now always derived server-side from
// platform_fee_rules; callers only ever supply what actually happened
// (gross revenue), never what they're owed.
async function createPayoutForOrderItem(orderItemId, trx = db) {
  const existing = await model.findByOrderItem(orderItemId, trx);

  if (existing) {
    return existing;
  }

  const orderItem = await orderItemModel.findById(orderItemId);

  if (!orderItem) {
    throw new Error('Order item not found');
  }

  if (!orderItem.seller_id) {
    throw new Error('Order item has no seller — cannot generate a payout');
  }

  const grossCents = orderItem.unit_price_cents * orderItem.quantity;

  let fulfillmentType = null;
  let baseProductType = null;

  if (orderItem.item_type === 'merch_variant' && orderItem.merch_variant_id) {
    const productInfo = await trx
      .selectFrom('merch_variants as mv')
      .innerJoin('merch_products as mp', 'mp.id', 'mv.merch_product_id')
      .select(['mp.fulfillment_type', 'mp.base_product_type'])
      .where('mv.id', '=', orderItem.merch_variant_id)
      .executeTakeFirst();

    fulfillmentType = productInfo?.fulfillment_type || null;
    baseProductType = productInfo?.base_product_type || null;
  }

  const rule = await feeRuleModel.findRule(fulfillmentType, baseProductType, trx);
  const feeBps = rule ? rule.fee_bps : 1500; // 15% fallback if no rule seeded
  const platformFeeCents = applyFeeBps(grossCents, feeBps);
  const amounts = calculatePayout(grossCents, platformFeeCents);

  return model.createPayout(
    {
      seller_id: orderItem.seller_id,
      order_item_id: orderItemId,
      ...amounts,
      status: 'pending',
    },
    trx
  );
}

// Called once an order is fully paid/fulfilled — generates (or reuses) a
// payout row for every line item on the order, grouped implicitly by
// seller since each order_item already carries its own seller_id.
async function generatePayoutsForOrder(orderId) {
  const items = await orderItemModel.findByOrderId(orderId);

  return db.transaction().execute(async (trx) => {
    const payouts = [];

    for (const item of items) {
      if (!item.seller_id) continue;

      payouts.push(await createPayoutForOrderItem(item.id, trx));
    }

    return payouts;
  });
}

// Manual/admin correction path — still available for one-off adjustments,
// but no longer the primary way payouts are created, and the fee is still
// computed from the rule table rather than trusting the caller.
async function createPayout({ orderItemId }) {
  return createPayoutForOrderItem(orderItemId);
}

async function getSellerPayouts(sellerId) {
  return model.findBySeller(sellerId);
}

async function markPaid(id, stripeTransferId) {
  const payout = await model.findById(id);

  if (!payout) {
    throw new Error('Payout not found');
  }

  return model.updateStatus(id, {
    status: 'paid',
    stripe_transfer_id: stripeTransferId,
  });
}

async function markFailed(id) {
  const payout = await model.findById(id);

  if (!payout) {
    throw new Error('Payout not found');
  }

  return model.updateStatus(id, {
    status: 'failed',
  });
}

module.exports = {
  createPayout,
  generatePayoutsForOrder,
  getSellerPayouts,
  markPaid,
  markFailed,
};
