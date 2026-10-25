// Stripe Connect settlement of the payouts ledger (TSK-024).
//
// Stripe is never called: a recording fake is injected. Assertions read the
// payouts table back rather than trusting return values, matching
// contests/contestLicensing.test.js.
//
// Needs the marketplace migration (payouts, order_items.seller_id). Run with
// a search_path pointing at a schema that has it, e.g.
//   DATABASE_URL="...?options=-csearch_path%3Dmkt_test" node --test tests/payouts

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { sql } = require('kysely');

const { db, requireDatabase } = require('../helpers/db');
const payoutModel = require('../../src/modules/payout/models/payout.model');
const settlement = require('../../src/modules/payout/payout-settlement.service');

// Late-sorting ids keep these rows away from suites that pick "first row by id".
const lateUuid = () => 'ffffffff' + crypto.randomUUID().slice(8);

const CONNECT_ACCOUNT = 'acct_test_settle_1';

/** Recording Stripe double. `failTransfer` makes transfers.create throw. */
function fakeStripe({ failTransfer = false, chargeTransfer = 'tr_from_charge' } = {}) {
  const calls = { transfers: [], charges: [], paymentIntents: [] };
  return {
    calls,
    transfers: {
      async create(params, options) {
        calls.transfers.push({ params, options });
        if (failTransfer) throw new Error('Insufficient funds in Stripe balance');
        return { id: `tr_${calls.transfers.length}`, ...params };
      },
    },
    charges: {
      async retrieve(id) {
        calls.charges.push(id);
        return { id, transfer: chargeTransfer };
      },
    },
    paymentIntents: {
      async retrieve(id, options) {
        calls.paymentIntents.push({ id, options });
        return { id, currency: 'usd', latest_charge: { id: 'ch_retrieved', transfer: null } };
      },
    },
  };
}

const platformChargePI = { id: 'pi_1', currency: 'usd', latest_charge: 'ch_1' };
const destinationChargePI = {
  id: 'pi_2',
  currency: 'usd',
  latest_charge: 'ch_2',
  transfer_data: { destination: CONNECT_ACCOUNT },
};

describe('payout settlement', () => {
  const tag = `pay${Date.now()}`;
  let skipReason = '';
  let connectedSellerId;
  let unconnectedSellerId;
  let buyerId;
  let artworkId;
  const orderIds = [];
  const createdPayoutIds = [];

  const payoutRow = (id) =>
    db
      .selectFrom('payouts')
      .select(['status', 'stripe_transfer_id', 'net_cents'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

  /** One order with one line item for `sellerId`; returns { orderId, payout }. */
  async function makeOrderWithPayout(sellerId, { gross = 10000, fee = 1500, status = 'pending' } = {}) {
    const orderId = lateUuid();
    await db
      .insertInto('orders')
      .values({
        id: orderId,
        order_number: `${tag}-${orderIds.length}`,
        buyer_id: buyerId,
        seller_id: sellerId,
        status: 'paid',
        total_cents: gross,
      })
      .execute();
    orderIds.push(orderId);

    const item = await db
      .insertInto('order_items')
      .values({
        id: lateUuid(),
        order_id: orderId,
        artwork_id: artworkId,
        license_type: 'personal',
        unit_price_cents: gross,
        seller_id: sellerId,
      })
      .returning('id')
      .executeTakeFirstOrThrow();

    const payout = await payoutModel.createPayout({
      id: lateUuid(),
      seller_id: sellerId,
      order_item_id: item.id,
      gross_cents: gross,
      platform_fee_cents: fee,
      net_cents: gross - fee,
      status,
    });
    createdPayoutIds.push(payout.id);

    return { orderId, payout };
  }

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

    const roles = await db.selectFrom('roles').select(['id', 'name']).execute();
    const roleId = (name) => (roles.find((r) => r.name === name) ?? roles[0])?.id;

    const insertUser = async (suffix, extra = {}) => {
      const row = await db
        .insertInto('users')
        .values({
          id: lateUuid(),
          username: `${tag}_${suffix}`,
          email: `${tag}_${suffix}@example.com`,
          role_id: roleId('ARTIST'),
          status: 'active',
          ...extra,
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      return row.id;
    };

    connectedSellerId = await insertUser('seller', { stripe_connect_id: CONNECT_ACCOUNT });
    unconnectedSellerId = await insertUser('nostripe');
    buyerId = await insertUser('buyer');

    const artwork = await db
      .insertInto('artworks')
      .values({
        id: lateUuid(),
        creator_id: connectedSellerId,
        title: `${tag} artwork`,
        file_url: 'https://example.com/a.png',
      })
      .returning('id')
      .executeTakeFirstOrThrow();
    artworkId = artwork.id;
  });

  after(async () => {
    if (skipReason) return;
    if (createdPayoutIds.length) {
      await db.deleteFrom('payouts').where('id', 'in', createdPayoutIds).execute();
    }
    if (orderIds.length) {
      await db.deleteFrom('order_items').where('order_id', 'in', orderIds).execute();
      await db.deleteFrom('orders').where('id', 'in', orderIds).execute();
    }
    if (artworkId) await db.deleteFrom('artworks').where('id', '=', artworkId).execute();
    const userIds = [connectedSellerId, unconnectedSellerId, buyerId].filter(Boolean);
    if (userIds.length) await db.deleteFrom('users').where('id', 'in', userIds).execute();
  });

  beforeEach(function (t) {
    if (skipReason) t.skip(skipReason);
  });

  it('creates a Stripe transfer for net_cents on a platform charge and marks the payout paid', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId, { gross: 10000, fee: 1500 });
    const stripe = fakeStripe();

    await settlement.settlePayout(payout, { orderId, paymentIntent: platformChargePI }, { stripe });

    assert.equal(stripe.calls.transfers.length, 1);
    const { params, options } = stripe.calls.transfers[0];
    assert.equal(params.amount, 8500, 'transfers the seller net, never the gross');
    assert.equal(params.currency, 'usd');
    assert.equal(params.destination, CONNECT_ACCOUNT);
    assert.equal(params.source_transaction, 'ch_1');
    assert.equal(params.transfer_group, orderId);
    assert.equal(options.idempotencyKey, `payout-settle-${payout.id}`);

    const row = await payoutRow(payout.id);
    assert.equal(row.status, 'paid');
    assert.equal(row.stripe_transfer_id, 'tr_1');
  });

  it('reuses the charge\'s transfer_group when the PaymentIntent carries one', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
    const stripe = fakeStripe();
    const pi = { ...platformChargePI, transfer_group: 'orders_first-order-id' };

    await settlement.settlePayout(payout, { orderId, paymentIntent: pi }, { stripe });

    assert.equal(stripe.calls.transfers[0].params.transfer_group, 'orders_first-order-id');
  });

  it('does not transfer again for a destination charge; records the transfer the charge already made', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
    const stripe = fakeStripe({ chargeTransfer: 'tr_dest_existing' });

    await settlement.settlePayout(payout, { orderId, paymentIntent: destinationChargePI }, { stripe });

    assert.equal(stripe.calls.transfers.length, 0, 'a second transfer would pay the seller twice');
    assert.deepEqual(stripe.calls.charges, ['ch_2']);
    const row = await payoutRow(payout.id);
    assert.equal(row.status, 'paid');
    assert.equal(row.stripe_transfer_id, 'tr_dest_existing');
  });

  it('fails the payout when the destination charge went to a different Connect account', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
    const stripe = fakeStripe();
    const pi = { ...destinationChargePI, transfer_data: { destination: 'acct_someone_else' } };

    await settlement.settlePayout(payout, { orderId, paymentIntent: pi }, { stripe });

    assert.equal(stripe.calls.transfers.length, 0);
    assert.equal((await payoutRow(payout.id)).status, 'failed');
  });

  it('leaves the payout pending when the seller has no Stripe Connect account', async () => {
    const { orderId, payout } = await makeOrderWithPayout(unconnectedSellerId);
    const stripe = fakeStripe();

    const result = await settlement.settlePayout(payout, { orderId, paymentIntent: platformChargePI }, { stripe });

    assert.equal(stripe.calls.transfers.length, 0);
    assert.equal(result.status, 'pending');
    assert.equal((await payoutRow(payout.id)).status, 'pending');
  });

  it('marks the payout failed, without throwing, when Stripe rejects the transfer', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
    const stripe = fakeStripe({ failTransfer: true });

    await assert.doesNotReject(() =>
      settlement.settlePayout(payout, { orderId, paymentIntent: platformChargePI }, { stripe })
    );

    const row = await payoutRow(payout.id);
    assert.equal(row.status, 'failed');
    assert.equal(row.stripe_transfer_id, null);
  });

  it('retries a failed payout and never touches a paid one', async () => {
    const failed = await makeOrderWithPayout(connectedSellerId, { status: 'failed' });
    const paid = await makeOrderWithPayout(connectedSellerId, { status: 'paid' });
    const stripe = fakeStripe();

    await settlement.settlePayout(failed.payout, { orderId: failed.orderId, paymentIntent: platformChargePI }, { stripe });
    await settlement.settlePayout(paid.payout, { orderId: paid.orderId, paymentIntent: platformChargePI }, { stripe });

    assert.equal(stripe.calls.transfers.length, 1, 'only the failed payout produces a transfer');
    assert.equal((await payoutRow(failed.payout.id)).status, 'paid');
    assert.equal((await payoutRow(paid.payout.id)).stripe_transfer_id, null, 'paid row untouched');
  });

  it('marks a zero-net payout paid without calling Stripe', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId, { gross: 100, fee: 100 });
    const stripe = fakeStripe();

    await settlement.settlePayout(payout, { orderId, paymentIntent: platformChargePI }, { stripe });

    assert.equal(stripe.calls.transfers.length, 0);
    assert.equal((await payoutRow(payout.id)).status, 'paid');
  });

  it('settlePayoutsForOrder settles every payout on the order', async () => {
    const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
    // Second line item on the same order.
    const item2 = await db
      .insertInto('order_items')
      .values({ id: lateUuid(), order_id: orderId, artwork_id: artworkId, license_type: 'commercial', unit_price_cents: 5000, seller_id: connectedSellerId })
      .returning('id')
      .executeTakeFirstOrThrow();
    const payout2 = await payoutModel.createPayout({
      id: lateUuid(), seller_id: connectedSellerId, order_item_id: item2.id,
      gross_cents: 5000, platform_fee_cents: 750, net_cents: 4250, status: 'pending',
    });
    createdPayoutIds.push(payout2.id);
    const stripe = fakeStripe();

    const settled = await settlement.settlePayoutsForOrder(orderId, platformChargePI, { stripe });

    assert.equal(settled.length, 2);
    assert.deepEqual(
      stripe.calls.transfers.map((c) => c.params.amount).sort((a, b) => a - b),
      [4250, 8500]
    );
    assert.equal((await payoutRow(payout.id)).status, 'paid');
    assert.equal((await payoutRow(payout2.id)).status, 'paid');
  });

  describe('settleById (admin retry)', () => {
    let hasPaymentIntentColumn = false;

    before(async () => {
      if (skipReason) return;
      // The production orders table predates stripe_payment_intent_id (see
      // prodmirror); on such a schema the retry endpoint cannot work and these
      // cases skip with that reason rather than hiding it behind a pass.
      const col = await sql`
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'orders'
          AND column_name = 'stripe_payment_intent_id'
      `.execute(db);
      hasPaymentIntentColumn = col.rows.length > 0;
    });

    it('rejects an unknown payout id', async () => {
      await assert.rejects(
        () => settlement.settleById(lateUuid(), { stripe: fakeStripe() }),
        /Payout not found/
      );
    });

    it('re-reads the PaymentIntent from Stripe and settles the payout', async function (t) {
      if (!hasPaymentIntentColumn) {
        t.skip('orders.stripe_payment_intent_id missing on this schema');
        return;
      }
      const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
      await db
        .updateTable('orders')
        .set({ stripe_payment_intent_id: 'pi_retry' })
        .where('id', '=', orderId)
        .execute();
      const stripe = fakeStripe();

      await settlement.settleById(payout.id, { stripe });

      assert.deepEqual(stripe.calls.paymentIntents[0], { id: 'pi_retry', options: { expand: ['latest_charge'] } });
      assert.equal(stripe.calls.transfers[0].params.source_transaction, 'ch_retrieved');
      assert.equal((await payoutRow(payout.id)).status, 'paid');
    });

    it('settlePayoutsForOrderById re-reads the PaymentIntent and settles the whole order', async function (t) {
      if (!hasPaymentIntentColumn) {
        t.skip('orders.stripe_payment_intent_id missing on this schema');
        return;
      }
      const { orderId, payout } = await makeOrderWithPayout(connectedSellerId);
      await db
        .updateTable('orders')
        .set({ stripe_payment_intent_id: 'pi_delivery' })
        .where('id', '=', orderId)
        .execute();
      const stripe = fakeStripe();

      const settled = await settlement.settlePayoutsForOrderById(orderId, { stripe });

      assert.equal(settled.length, 1);
      assert.equal(stripe.calls.paymentIntents[0].id, 'pi_delivery');
      assert.equal((await payoutRow(payout.id)).status, 'paid');
    });

    it('settlePayoutsForOrderById rejects an order with no payment intent', async function (t) {
      if (!hasPaymentIntentColumn) {
        t.skip('orders.stripe_payment_intent_id missing on this schema');
        return;
      }
      const { orderId } = await makeOrderWithPayout(connectedSellerId);

      await assert.rejects(
        () => settlement.settlePayoutsForOrderById(orderId, { stripe: fakeStripe() }),
        /no Stripe payment intent/
      );
    });

    it('rejects when the order has no payment intent recorded', async function (t) {
      if (!hasPaymentIntentColumn) {
        t.skip('orders.stripe_payment_intent_id missing on this schema');
        return;
      }
      const { payout } = await makeOrderWithPayout(connectedSellerId);

      await assert.rejects(
        () => settlement.settleById(payout.id, { stripe: fakeStripe() }),
        /no Stripe payment intent/
      );
    });
  });
});
