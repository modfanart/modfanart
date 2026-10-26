const service = require('./order.service');

function handleError(res, error, status = 400) {
  console.error(error);

  return res.status(status).json({
    error: error.message || 'Something went wrong',
  });
}

async function getMyOrders(req, res) {
  try {
    return res.json({ orders: await service.getBuyerOrders(req.user.id) });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getSellerOrders(req, res) {
  try {
    return res.json({ orders: await service.getSellerOrders(req.user.id) });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getAllOrders(req, res) {
  try {
    return res.json(await service.getAllOrders(req.query));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getOrder(req, res) {
  try {
    return res.json({ order: await service.getOrder(req.user, req.params.id) });
  } catch (error) {
    const status = /not found/i.test(error.message)
      ? 404
      : /access/i.test(error.message)
        ? 403
        : 400;
    return handleError(res, error, status);
  }
}

async function createPayment(req, res) {
  try {
    return res.json(await service.createPayment(req.user.id, req.body.order_ids));
  } catch (error) {
    return handleError(res, error);
  }
}

async function confirmPayment(req, res) {
  try {
    return res.json(
      await service.confirmPayment(req.user.id, req.body.payment_intent_id)
    );
  } catch (error) {
    return handleError(res, error);
  }
}

async function cancelOrder(req, res) {
  try {
    const order = await service.cancelOrder(req.user.id, req.params.id);
    return res.json({ message: 'Order cancelled', order });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  getOrder,
  createPayment,
  confirmPayment,
  cancelOrder,
};
