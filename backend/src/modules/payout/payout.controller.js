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

async function createPayout(req, res) {
  try {
    const payout = await service.createPayout({
      sellerId: req.body.seller_id,
      orderItemId: req.body.order_item_id,
      grossCents: req.body.gross_cents,
      platformFeeCents: req.body.platform_fee_cents,
    });

    return res.status(201).json({
      message: 'Payout created',
      payout,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getMyPayouts,
  createPayout,
};
