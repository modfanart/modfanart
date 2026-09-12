const model = require('./models/payout.model');

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

async function createPayout({
  sellerId,
  orderItemId,
  grossCents,
  platformFeeCents,
}) {
  const existing = await model.findByOrderItem(orderItemId);

  if (existing) {
    throw new Error('Payout already exists for this order item');
  }

  const amounts = calculatePayout(grossCents, platformFeeCents);

  return model.createPayout({
    seller_id: sellerId,
    order_item_id: orderItemId,
    ...amounts,
    status: 'pending',
  });
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
  getSellerPayouts,
  markPaid,
  markFailed,
};
