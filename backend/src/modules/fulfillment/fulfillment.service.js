const { db } = require('../../config');
const model = require('./fulfillment.model');

async function getOrderFulfillments(orderId) {
  const fulfillments = await model.findByOrderId(orderId);

  for (const fulfillment of fulfillments) {
    fulfillment.items = await model.getItems(fulfillment.id);
  }

  return fulfillments;
}

async function createFulfillment({
  orderId,
  addressId,
  printProviderId,
  orderItemIds,
}) {
  if (!orderItemIds?.length) {
    throw new Error('At least one order item is required');
  }

  return db.transaction().execute(async (trx) => {
    const fulfillment = await model.createFulfillment(
      {
        order_id: orderId,
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

async function updateStatus(id, status) {
  const fulfillment = await model.findById(id);

  if (!fulfillment) {
    throw new Error('Fulfillment not found');
  }

  return model.updateStatus(id, status);
}

async function updateTracking(id, data) {
  const fulfillment = await model.findById(id);

  if (!fulfillment) {
    throw new Error('Fulfillment not found');
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
