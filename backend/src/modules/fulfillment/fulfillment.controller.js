const service = require('./fulfillment.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function getOrderFulfillments(req, res) {
  try {
    const fulfillments = await service.getOrderFulfillments(req.params.orderId);

    return res.json({ fulfillments });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createFulfillment(req, res) {
  try {
    const fulfillment = await service.createFulfillment({
      sellerId: req.user.id,
      orderId: req.params.orderId,
      addressId: req.body.address_id,
      printProviderId: req.body.print_provider_id,
      orderItemIds: req.body.order_item_ids,
    });

    return res.status(201).json({
      message: 'Fulfillment created',
      fulfillment,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateStatus(req, res) {
  try {
    const fulfillment = await service.updateStatus(
      req.user.id,
      req.params.id,
      req.body.status
    );

    return res.json({
      message: 'Fulfillment status updated',
      fulfillment,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateTracking(req, res) {
  try {
    const fulfillment = await service.updateTracking(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.json({
      message: 'Tracking updated',
      fulfillment,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getOrderFulfillments,
  createFulfillment,
  updateStatus,
  updateTracking,
};
