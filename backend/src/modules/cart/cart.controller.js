const service = require('./cart.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function getCart(req, res) {
  try {
    const cart = await service.getOrCreateCart(req.user.id);

    return res.json({ cart });
  } catch (error) {
    return handleError(res, error);
  }
}

async function addMerchItem(req, res) {
  try {
    const item = await service.addMerchItem(
      req.user.id,
      req.body.merch_variant_id,
      req.body.quantity
    );

    return res.status(201).json({
      message: 'Item added to cart',
      item,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function addLicenseItem(req, res) {
  try {
    const item = await service.addLicenseItem(
      req.user.id,
      req.body.artwork_id,
      req.body.license_type,
      req.body.quantity
    );

    return res.status(201).json({
      message: 'License added to cart',
      item,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateItem(req, res) {
  try {
    const item = await service.updateItem(
      req.user.id,
      req.params.itemId,
      req.body.quantity
    );

    return res.json({
      message: 'Cart updated',
      item,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function removeItem(req, res) {
  try {
    await service.removeItem(req.user.id, req.params.itemId);

    return res.json({
      message: 'Item removed',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getCart,
  addMerchItem,
  addLicenseItem,
  updateItem,
  removeItem,
};
