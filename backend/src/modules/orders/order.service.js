// src/modules/orders/order.service.js
//
// Read + payment side of the cart/merch order flow. cart.service#checkout
// creates one *pending* order per seller; everything after that (listing
// them, paying for them, confirming payment, cancelling) lives here so the
// frontend has a single, merch-aware orders API.
const { db } = require('../../config');
const { sql } = require('kysely');
const { stripe } = require('../../config/stripe');
const OrderFulfillmentService = require('../licenses/services/order-fullfillment.service');
const fulfillmentModel = require('../fulfillment/models/fulfillment.model');

const MAX_ORDERS_PER_PAYMENT = 10; // Stripe metadata values cap at 500 chars

// ── Helpers ─────────────────────────────────────────────────────────────

function hasAdminPermission(user) {
  const p = user?.permissions || {};
  return Boolean(p['orders.view_all'] || p['payouts.manage']);
}

async function fetchItems(orderIds, { sellerId = null } = {}) {
  if (!orderIds.length) return [];

  let q = db
    .selectFrom('order_items as oi')
    .leftJoin('merch_variants as mv', 'mv.id', 'oi.merch_variant_id')
    .leftJoin('merch_products as mp', 'mp.id', 'mv.merch_product_id')
    .leftJoin('artworks as a', 'a.id', 'oi.artwork_id')
    .leftJoin('licenses as l', 'l.order_item_id', 'oi.id')
    .leftJoin('users as su', 'su.id', 'oi.seller_id')
    .leftJoin('product_reviews as pr', (join) =>
      join.onRef('pr.order_item_id', '=', 'oi.id').on('pr.deleted_at', 'is', null)
    )
    .selectAll('oi')
    .select([
      'mv.sku',
      'mv.size',
      'mv.color',
      'mv.material',
      'mp.id as merch_product_id',
      'mp.title as product_title',
      'a.title as artwork_title',
      sql`coalesce(a.thumbnail_url, mv.print_file_url)`.as('image_url'),
      'l.id as license_id',
      'l.contract_pdf_url',
      'l.is_active as license_active',
      'su.username as seller_username',
      'pr.id as review_id',
      'pr.rating as review_rating',
    ])
    .where('oi.order_id', 'in', orderIds)
    .orderBy('oi.id', 'asc');

  if (sellerId) q = q.where('oi.seller_id', '=', sellerId);

  return q.execute();
}

async function fetchFulfillments(orderIds, { sellerId = null } = {}) {
  if (!orderIds.length) return [];

  let q = db
    .selectFrom('fulfillments')
    .selectAll()
    .where('order_id', 'in', orderIds)
    .orderBy('created_at', 'asc');

  if (sellerId) q = q.where('seller_id', '=', sellerId);

  const fulfillments = await q.execute();

  for (const f of fulfillments) {
    f.items = await fulfillmentModel.getItems(f.id);
  }

  return fulfillments;
}

async function fetchAddresses(addressIds) {
  const ids = [...new Set(addressIds.filter(Boolean))];
  if (!ids.length) return new Map();

  const rows = await db
    .selectFrom('addresses')
    .selectAll()
    .where('id', 'in', ids)
    .execute();

  return new Map(rows.map((r) => [r.id, r]));
}

async function hydrate(orders, { sellerId = null, withFulfillments = true } = {}) {
  const ids = orders.map((o) => o.id);
  const [items, fulfillments, addresses] = await Promise.all([
    fetchItems(ids, { sellerId }),
    withFulfillments ? fetchFulfillments(ids, { sellerId }) : [],
    fetchAddresses(orders.map((o) => o.shipping_address_id)),
  ]);

  return orders.map((o) => ({
    ...o,
    items: items.filter((i) => i.order_id === o.id),
    fulfillments: fulfillments.filter((f) => f.order_id === o.id),
    shipping_address: o.shipping_address_id
      ? addresses.get(o.shipping_address_id) || null
      : null,
  }));
}

// ── Access ──────────────────────────────────────────────────────────────

// Who may see an order: its buyer, any seller with a line item on it, or an
// admin/finance user.
async function getOrderAccess(user, orderId) {
  const order = await db
    .selectFrom('orders')
    .selectAll()
    .where('id', '=', orderId)
    .executeTakeFirst();

  if (!order) return { order: null, role: null };

  if (order.buyer_id === user.id) return { order, role: 'buyer' };

  if (hasAdminPermission(user)) return { order, role: 'admin' };

  const sellerItem = await db
    .selectFrom('order_items')
    .select('id')
    .where('order_id', '=', orderId)
    .where('seller_id', '=', user.id)
    .executeTakeFirst();

  if (sellerItem || order.seller_id === user.id) return { order, role: 'seller' };

  return { order, role: null };
}

// ── Reads ───────────────────────────────────────────────────────────────

async function getBuyerOrders(userId) {
  const orders = await db
    .selectFrom('orders')
    .selectAll()
    .where('buyer_id', '=', userId)
    .orderBy('created_at', 'desc')
    .execute();

  return hydrate(orders);
}

async function getSellerOrders(sellerId) {
  const orders = await db
    .selectFrom('orders as o')
    .innerJoin('users as bu', 'bu.id', 'o.buyer_id')
    .selectAll('o')
    .select(['bu.username as buyer_username'])
    .where('o.status', 'not in', ['pending', 'failed'])
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom('order_items as oi')
          .select(sql`1`.as('one'))
          .whereRef('oi.order_id', '=', 'o.id')
          .where('oi.seller_id', '=', sellerId)
      )
    )
    .orderBy('o.created_at', 'desc')
    .execute();

  return hydrate(orders, { sellerId });
}

async function getAllOrders({ status, limit = 50, offset = 0 } = {}) {
  let q = db
    .selectFrom('orders as o')
    .leftJoin('users as bu', 'bu.id', 'o.buyer_id')
    .selectAll('o')
    .select(['bu.username as buyer_username', 'bu.email as buyer_email'])
    .orderBy('o.created_at', 'desc')
    .limit(Math.min(Number(limit) || 50, 200))
    .offset(Number(offset) || 0);

  if (status) q = q.where('o.status', '=', status);

  const orders = await q.execute();

  const totals = await db
    .selectFrom('orders')
    .select([
      'status',
      sql`count(*)::int`.as('count'),
      sql`coalesce(sum(total_cents), 0)::bigint`.as('total_cents'),
    ])
    .groupBy('status')
    .execute();

  return {
    orders: await hydrate(orders, { withFulfillments: false }),
    totals: totals.map((t) => ({ ...t, total_cents: Number(t.total_cents) })),
  };
}

async function getOrder(user, orderId) {
  const { order, role } = await getOrderAccess(user, orderId);

  if (!order) throw new Error('Order not found');
  if (!role) throw new Error('You do not have access to this order');

  const [hydrated] = await hydrate([order], {
    sellerId: role === 'seller' ? user.id : null,
  });

  const buyer = await db
    .selectFrom('users')
    .select(['id', 'username'])
    .where('id', '=', order.buyer_id)
    .executeTakeFirst();

  return { ...hydrated, buyer_username: buyer?.username || null, viewer_role: role };
}

// ── Payment ─────────────────────────────────────────────────────────────

async function createPayment(userId, orderIds) {
  if (!Array.isArray(orderIds) || !orderIds.length) {
    throw new Error('order_ids is required');
  }

  const ids = [...new Set(orderIds)];

  if (ids.length > MAX_ORDERS_PER_PAYMENT) {
    throw new Error(`You can pay for at most ${MAX_ORDERS_PER_PAYMENT} orders at once`);
  }

  const orders = await db
    .selectFrom('orders')
    .selectAll()
    .where('id', 'in', ids)
    .execute();

  if (orders.length !== ids.length) throw new Error('Order not found');

  for (const order of orders) {
    if (order.buyer_id !== userId) throw new Error('Order does not belong to you');
    if (order.status !== 'pending') {
      throw new Error(`Order ${order.order_number} is not awaiting payment`);
    }
  }

  // The platform is USD-only. A pending order in any other currency can
  // only be a leftover from before that change — refuse to charge it
  // rather than quietly re-labelling its amount.
  const currency = 'USD';

  if (orders.some((o) => String(o.currency).toUpperCase() !== currency)) {
    throw new Error(
      'This order was created in a currency we no longer support. Please cancel it and check out again.'
    );
  }

  // Physical goods need somewhere to go.
  const merch = await db
    .selectFrom('order_items')
    .select('order_id')
    .where('order_id', 'in', ids)
    .where('item_type', '=', 'merch_variant')
    .execute();

  const merchOrderIds = new Set(merch.map((m) => m.order_id));

  for (const order of orders) {
    if (merchOrderIds.has(order.id) && !order.shipping_address_id) {
      throw new Error(`Order ${order.order_number} needs a shipping address`);
    }
  }

  const amount = orders.reduce((sum, o) => sum + Number(o.total_cents), 0);

  if (amount <= 0) throw new Error('Nothing to pay');

  // Reuse an in-flight PaymentIntent for exactly this set of orders so a
  // refresh on the checkout page doesn't mint a second one.
  const existingId = orders[0].stripe_payment_intent_id;

  if (existingId && orders.every((o) => o.stripe_payment_intent_id === existingId)) {
    try {
      const existing = await stripe.paymentIntents.retrieve(existingId);

      if (
        existing.amount === amount &&
        ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(
          existing.status
        )
      ) {
        return {
          clientSecret: existing.client_secret,
          paymentIntentId: existing.id,
          amount,
          currency,
          orderIds: ids,
        };
      }
    } catch (err) {
      console.error('Could not reuse payment intent:', err.message);
    }
  }

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_group: `orders_${ids[0]}`,
    metadata: {
      order_ids: ids.join(','),
      buyer_id: userId,
    },
  });

  await db
    .updateTable('orders')
    .set({ stripe_payment_intent_id: intent.id, updated_at: new Date().toISOString() })
    .where('id', 'in', ids)
    .execute();

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
    orderIds: ids,
  };
}

// Frontend calls this right after stripe.confirmCardPayment succeeds. The
// Stripe webhook is the source of truth, but it can lag (or not be wired up
// in dev) — fulfillOrder is idempotent so running it from both is safe.
async function confirmPayment(userId, paymentIntentId) {
  if (!paymentIntentId) throw new Error('payment_intent_id is required');

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.metadata?.buyer_id !== userId) {
    throw new Error('This payment does not belong to you');
  }

  if (intent.status === 'succeeded') {
    await OrderFulfillmentService.fulfillOrder(intent);
  }

  const ids = (intent.metadata.order_ids || intent.metadata.order_id || '')
    .split(',')
    .filter(Boolean);

  const orders = ids.length
    ? await db.selectFrom('orders').selectAll().where('id', 'in', ids).execute()
    : [];

  return {
    payment_status: intent.status,
    orders: await hydrate(orders, { withFulfillments: false }),
  };
}

async function cancelOrder(userId, orderId) {
  const order = await db
    .selectFrom('orders')
    .selectAll()
    .where('id', '=', orderId)
    .executeTakeFirst();

  if (!order) throw new Error('Order not found');
  if (order.buyer_id !== userId) throw new Error('Order does not belong to you');
  if (order.status !== 'pending') throw new Error('Only unpaid orders can be cancelled');

  await OrderFulfillmentService.markOrderAsFailed(orderId);

  return db.selectFrom('orders').selectAll().where('id', '=', orderId).executeTakeFirst();
}

// Checkout reserves stock up-front, so an order the buyer never pays for
// would hold that inventory forever. This sweeper fails cart-created orders
// that have sat unpaid past `maxAgeMinutes`, returning their stock.
//
// Because the webhook can lag behind a real payment, each candidate's
// PaymentIntent is checked first: a succeeded one is fulfilled instead of
// expired, and a still-open one is cancelled so it can't be paid after the
// stock has been released.
async function expireStalePendingOrders(maxAgeMinutes = 60) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

  const stale = await db
    .selectFrom('orders')
    .select(['id', 'stripe_payment_intent_id'])
    .where('status', '=', 'pending')
    .where('cart_id', 'is not', null)
    .where('created_at', '<', cutoff)
    .limit(100)
    .execute();

  let expired = 0;

  for (const order of stale) {
    try {
      if (order.stripe_payment_intent_id) {
        const intent = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id
        );

        if (intent.status === 'succeeded') {
          await OrderFulfillmentService.fulfillOrder(intent);
          continue;
        }

        if (
          ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(
            intent.status
          )
        ) {
          await stripe.paymentIntents.cancel(intent.id);
        } else if (intent.status === 'processing') {
          continue; // money is in flight — let the webhook decide
        }
      }

      await OrderFulfillmentService.markOrderAsFailed(order.id);
      expired += 1;
    } catch (err) {
      console.error(`Could not expire order ${order.id}:`, err.message);
    }
  }

  return expired;
}

module.exports = {
  expireStalePendingOrders,
  getOrderAccess,
  getBuyerOrders,
  getSellerOrders,
  getAllOrders,
  getOrder,
  createPayment,
  confirmPayment,
  cancelOrder,
};
