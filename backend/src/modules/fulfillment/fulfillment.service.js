const { db } = require('../../config');
const model = require('./models/fulfillment.model');
const Order = require('../licenses/models/order.model');
const OrderItem = require('../licenses/models/orderItem.model');
const addressModel = require('../address/models/address.model');
const payoutService = require('../payout/payout.service');

// Who may read an order's shipments: buyer, a seller with a line item on it,
// or an admin/finance user. (Previously any logged-in user could read any
// order's fulfillments by id.)
async function assertCanViewOrder(user, orderId) {
  const order = await Order.findById(orderId);

  if (!order) throw new Error('Order not found');
  if (!user) return order;
  if (order.buyer_id === user.id) return order;

  const perms = user.permissions || {};
  if (perms['orders.view_all'] || perms['payouts.manage']) return order;

  const mine = await db
    .selectFrom('order_items')
    .select('id')
    .where('order_id', '=', orderId)
    .where('seller_id', '=', user.id)
    .executeTakeFirst();

  if (!mine && order.seller_id !== user.id) {
    throw new Error('You do not have access to this order');
  }

  return order;
}

async function getOrderFulfillments(orderId, user) {
  await assertCanViewOrder(user, orderId);

  const fulfillments = await model.findByOrderId(orderId);

  for (const fulfillment of fulfillments) {
    fulfillment.items = await model.getItems(fulfillment.id);
  }

  return fulfillments;
}

// A seller creates a fulfillment for the subset of order_items on an order
// that belong to them — an order can span multiple sellers (see
// order_items.seller_id), so each seller ships their own line items
// independently and gets their own fulfillment record.
async function createFulfillment({
  sellerId,
  orderId,
  addressId,
  printProviderId,
  orderItemIds,
}) {
  if (!orderItemIds?.length) {
    throw new Error('At least one order item is required');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'paid' && order.status !== 'fulfilled') {
    throw new Error('Order must be paid before it can be fulfilled');
  }

  // Default to the address the buyer chose at checkout.
  addressId = addressId || order.shipping_address_id || null;

  if (addressId) {
    const address = await addressModel.findById(addressId);

    if (!address || address.user_id !== order.buyer_id) {
      throw new Error('Address does not belong to the buyer on this order');
    }
  }

  return db.transaction().execute(async (trx) => {
    // Every order item must belong to this order AND this seller — a
    // seller must never be able to mark another seller's items as shipped,
    // and items must never be scattered across the wrong order.
    for (const orderItemId of orderItemIds) {
      const item = await OrderItem.findById(orderItemId);

      if (!item || item.order_id !== orderId) {
        throw new Error(
          `Order item ${orderItemId} does not belong to this order`
        );
      }

      if (sellerId && item.seller_id !== sellerId) {
        throw new Error(
          `Order item ${orderItemId} does not belong to you`
        );
      }
    }

    const fulfillment = await model.createFulfillment(
      {
        order_id: orderId,
        seller_id: sellerId || null,
        address_id: addressId || null,
        print_provider_id: printProviderId || null,
        status: 'pending',
      },
      trx
    );

    await model.addItems(
      orderItemIds.map((orderItemId) => ({
        fulfillment_id: fulfillment.id,
        order_item_id: orderItemId,
      })),
      trx
    );

    return fulfillment;
  });
}

const VALID_STATUSES = [
  'pending',
  'in_production',
  'shipped',
  'delivered',
  'failed',
  'returned',
];

async function updateStatus(sellerId, id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Invalid fulfillment status');
  }

  const fulfillment = await model.findById(id);

  if (!fulfillment) {
    throw new Error('Fulfillment not found');
  }

  if (sellerId && fulfillment.seller_id && fulfillment.seller_id !== sellerId) {
    throw new Error('You do not own this fulfillment');
  }

  const updated = await model.updateStatus(id, status);

  if (status === 'delivered') {
    await completeOrderIfDelivered(updated.order_id);
  }

  return updated;
}

// An order with physical goods becomes "fulfilled" once every merch line has
// been delivered. That is also the moment its seller payouts are generated
// (digital-only orders get theirs at payment time instead).
async function completeOrderIfDelivered(orderId) {
  const order = await Order.findById(orderId);

  if (!order || order.status !== 'paid') return;

  const merchItems = await db
    .selectFrom('order_items')
    .select('id')
    .where('order_id', '=', orderId)
    .where('item_type', '=', 'merch_variant')
    .execute();

  if (!merchItems.length) return;

  const delivered = await db
    .selectFrom('fulfillment_items as fi')
    .innerJoin('fulfillments as f', 'f.id', 'fi.fulfillment_id')
    .select('fi.order_item_id')
    .where('f.order_id', '=', orderId)
    .where('f.status', '=', 'delivered')
    .execute();

  const deliveredIds = new Set(delivered.map((d) => d.order_item_id));

  if (!merchItems.every((i) => deliveredIds.has(i.id))) return;

  await db
    .updateTable('orders')
    .set({
      status: 'fulfilled',
      fulfilled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', orderId)
    .execute();

  try {
    await payoutService.generatePayoutsForOrder(orderId);
  } catch (err) {
    console.error(`Payout generation failed for order ${orderId}:`, err);
  }
}

async function updateTracking(sellerId, id, data) {
  const fulfillment = await model.findById(id);

  if (!fulfillment) {
    throw new Error('Fulfillment not found');
  }

  if (sellerId && fulfillment.seller_id && fulfillment.seller_id !== sellerId) {
    throw new Error('You do not own this fulfillment');
  }

  return model.updateTracking(id, {
    carrier: data.carrier || null,
    tracking_number: data.tracking_number || null,
    tracking_url: data.tracking_url || null,
  });
}

module.exports = {
  getOrderFulfillments,
  createFulfillment,
  updateStatus,
  updateTracking,
};
