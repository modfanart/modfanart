const service = require('./merch.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function createProduct(req, res) {
  try {
    const product = await service.createProduct(req.user.id, req.body);

    return res.status(201).json({
      message: 'Merch product created',
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getProduct(req, res) {
  try {
    const product = await service.getProduct(req.params.id);

    return res.json({ product });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMyProducts(req, res) {
  try {
    const products = await service.getSellerProducts(req.user.id);

    return res.json({ products });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPublishedProducts(req, res) {
  try {
    const products = await service.getPublishedProducts();

    return res.json({ products });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateProduct(req, res) {
  try {
    const product = await service.updateProduct(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.json({
      message: 'Product updated',
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteProduct(req, res) {
  try {
    await service.deleteProduct(req.user.id, req.params.id);

    return res.json({
      message: 'Product deleted',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function addVariant(req, res) {
  try {
    const variant = await service.addVariant(
      req.user.id,
      req.params.productId,
      req.body
    );

    return res.status(201).json({
      message: 'Variant created',
      variant,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateVariant(req, res) {
  try {
    const variant = await service.updateVariant(
      req.user.id,
      req.params.variantId,
      req.body
    );

    return res.json({
      message: 'Variant updated',
      variant,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteVariant(req, res) {
  try {
    await service.deleteVariant(req.user.id, req.params.variantId);

    return res.json({
      message: 'Variant deleted',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createProduct,
  getProduct,
  getMyProducts,
  getPublishedProducts,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
