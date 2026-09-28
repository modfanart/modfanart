const service = require('./payout.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function getMyPayouts(req, res) {
  try {
    const payouts = await service.getSellerPayouts(req.user.id);

    return res.json({ payouts });
  } catch (error) {
    return handleError(res, error);
  }
}

// Admin-only: manually (re)generate a payout for a specific order item, e.g.
// to correct a payout that failed to auto-generate. The fee is still always
// computed server-side from platform_fee_rules — this endpoint cannot be
// used to set a custom fee.
async function createPayout(req, res) {
  try {
    const payout = await service.createPayout({
      orderItemId: req.body.order_item_id,
    });

    return res.status(201).json({
      message: 'Payout created',
      payout,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// Admin-only: (re)generate payouts for every line item on an order — the
// normal path once a webhook or admin marks an order fulfilled.
async function generateForOrder(req, res) {
  try {
    const payouts = await service.generatePayoutsForOrder(req.params.orderId);

    return res.status(201).json({
      message: 'Payouts generated',
      payouts,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function markPaid(req, res) {
  try {
    const payout = await service.markPaid(
      req.params.id,
      req.body.stripe_transfer_id
    );

    return res.json({
      message: 'Payout marked as paid',
      payout,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function markFailed(req, res) {
  try {
    const payout = await service.markFailed(req.params.id);

    return res.json({
      message: 'Payout marked as failed',
      payout,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getMyPayouts,
  createPayout,
  generateForOrder,
  markPaid,
  markFailed,
};
