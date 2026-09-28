const { db } = require('../../config');
const model = require('./models/fulfillment.model');
const Order = require('../licenses/models/order.model');
const OrderItem = require('../licenses/models/orderItem.model');
const addressModel = require('../address/models/address.model');

async function getOrderFulfillments(orderId) {
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

  return model.updateStatus(id, status);
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
