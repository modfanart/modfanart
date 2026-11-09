// Settles pending payouts against Stripe Connect (TSK-024).
//
// Two payment shapes reach this code and they must be told apart, or sellers
// get paid twice:
//
//  1. Destination charges (licensePurchase.controller sets
//     transfer_data.destination + application_fee_amount): Stripe already moved
//     the seller's share when the charge settled. The payout is marked paid
//     with the transfer that charge produced; no new transfer is made.
//  2. Plain platform charges (one cart fans out into one order per seller):
//     nothing has moved yet, so a Transfer is created for the payout's
//     net_cents, tied to the charge via source_transaction so it can draw on
//     that charge's pending balance instead of needing settled funds.
//
// Currency is taken from the PaymentIntent rather than orders.currency: the
// production orders table predates that column.
const { db } = require('../../config');
const { stripe: defaultStripe } = require('../../config/stripe');
const model = require('./models/payout.model');

// 'paid' is terminal. 'failed' stays settleable so an admin can retry after
// the seller fixes their Connect account.
const SETTLEABLE_STATUSES = ['pending', 'failed'];

function chargeIdOf(paymentIntent) {
  const latest = paymentIntent.latest_charge;
  if (latest && typeof latest === 'object') return latest.id;
  return latest || paymentIntent.charges?.data?.[0]?.id || null;
}

async function findConnectAccount(sellerId, trx = db) {
  const seller = await trx
    .selectFrom('users')
    .select('stripe_connect_id')
    .where('id', '=', sellerId)
    .executeTakeFirst();

  return seller?.stripe_connect_id || null;
}

// For a destination charge the transfer already exists on the charge object.
async function existingTransferId(paymentIntent, stripe) {
  const latest = paymentIntent.latest_charge;
  if (latest && typeof latest === 'object') return latest.transfer || null;

  const chargeId = chargeIdOf(paymentIntent);
  if (!chargeId) return null;

  const charge = await stripe.charges.retrieve(chargeId);
  return charge.transfer || null;
}

async function settleDestinationCharge(payout, paymentIntent, destination, stripe) {
  if (paymentIntent.transfer_data.destination !== destination) {
    // The charge paid a different Connect account than the seller has on
    // file now. Nothing can be moved safely; leave it to an admin.
    console.error(
      `Payout ${payout.id}: charge went to ${paymentIntent.transfer_data.destination} but seller ${payout.seller_id} is ${destination}`
    );
    return model.updateStatus(payout.id, { status: 'failed' });
  }

  const transferId = await existingTransferId(paymentIntent, stripe);
  return model.updateStatus(payout.id, { status: 'paid', stripe_transfer_id: transferId });
}

async function settleWithTransfer(payout, paymentIntent, destination, orderId, stripe) {
  try {
    const transfer = await stripe.transfers.create(
      {
        amount: payout.net_cents,
        currency: paymentIntent.currency,
        destination,
        source_transaction: chargeIdOf(paymentIntent) || undefined,
        // Match the group the charge was created under (orders service uses
        // `orders_<firstId>` for a multi-order payment) so Stripe reports
        // charge and transfers together.
        transfer_group: paymentIntent.transfer_group || orderId,
        description: `Payout ${payout.id} for order ${orderId}`,
        metadata: { payout_id: payout.id, order_id: orderId, order_item_id: payout.order_item_id },
      },
      // One Stripe transfer per payout row, even if the webhook is replayed.
      { idempotencyKey: `payout-settle-${payout.id}` }
    );

    return model.updateStatus(payout.id, { status: 'paid', stripe_transfer_id: transfer.id });
  } catch (err) {
    console.error(
      `Stripe transfer failed for payout ${payout.id} (order ${orderId}, item ${payout.order_item_id}): ${err.message}`
    );
    return model.updateStatus(payout.id, { status: 'failed' });
  }
}

/**
 * Settle one payout against the PaymentIntent that paid for its order.
 * Returns the (possibly unchanged) payout row. Never throws for Stripe
 * failures: those become status 'failed' so the ledger records them.
 *
 * @param {object} payout PayoutRow
 * @param {{ orderId: string, paymentIntent: object }} payment
 * @param {{ stripe?: object }} [deps] injectable Stripe client (tests)
 */
async function settlePayout(payout, { orderId, paymentIntent }, { stripe = defaultStripe } = {}) {
  if (!SETTLEABLE_STATUSES.includes(payout.status)) return payout;

  const destination = await findConnectAccount(payout.seller_id);
  if (!destination) {
    // Not a failure: the seller has not finished Stripe onboarding, so the
    // payout waits as 'pending' until an admin retries after they connect.
    console.warn(`Payout ${payout.id}: seller ${payout.seller_id} has no Stripe Connect account yet`);
    return payout;
  }

  if (payout.net_cents === 0) {
    return model.updateStatus(payout.id, { status: 'paid', stripe_transfer_id: null });
  }

  if (paymentIntent.transfer_data?.destination) {
    return settleDestinationCharge(payout, paymentIntent, destination, stripe);
  }

  return settleWithTransfer(payout, paymentIntent, destination, orderId, stripe);
}

/**
 * Settle every payout on an order. Called from the payment_intent.succeeded
 * webhook right after the payouts are generated.
 */
async function settlePayoutsForOrder(orderId, paymentIntent, deps) {
  const payouts = await model.findByOrder(orderId);
  const settled = [];

  for (const payout of payouts) {
    settled.push(await settlePayout(payout, { orderId, paymentIntent }, deps));
  }

  return settled;
}

async function retrievePaymentIntent(paymentIntentId, stripe) {
  return stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
}

/**
 * Settle every payout on an order when the PaymentIntent is not in hand
 * (merch orders complete on delivery, long after the webhook). Re-reads it
 * from Stripe via orders.stripe_payment_intent_id.
 * @throws {Error} when the order has no payment intent recorded.
 */
async function settlePayoutsForOrderById(orderId, { stripe = defaultStripe } = {}) {
  const paymentIntentId = await model.findPaymentIntentIdForOrder(orderId);
  if (!paymentIntentId) {
    throw new Error(`Order ${orderId} has no Stripe payment intent to settle against`);
  }

  const paymentIntent = await retrievePaymentIntent(paymentIntentId, stripe);
  return settlePayoutsForOrder(orderId, paymentIntent, { stripe });
}

/**
 * Admin retry: re-read the PaymentIntent from Stripe and settle one payout.
 * @throws {Error} when the payout or its payment intent cannot be found.
 */
async function settleById(payoutId, { stripe = defaultStripe } = {}) {
  const payout = await model.findById(payoutId);
  if (!payout) throw new Error('Payout not found');

  const ref = await model.findOrderRefForPayout(payoutId);
  if (!ref?.stripe_payment_intent_id) {
    throw new Error('Order has no Stripe payment intent to settle against');
  }

  const paymentIntent = await retrievePaymentIntent(ref.stripe_payment_intent_id, stripe);
  return settlePayout(payout, { orderId: ref.order_id, paymentIntent }, { stripe });
}

module.exports = {
  settlePayout,
  settlePayoutsForOrder,
  settlePayoutsForOrderById,
  settleById,
};
