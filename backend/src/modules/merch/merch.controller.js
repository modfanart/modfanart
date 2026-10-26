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
    const products = await service.getPublishedProducts({
      search: req.query.search,
      type: req.query.type,
      fulfillment_type: req.query.fulfillment_type,
      brand_id: req.query.brand_id,
      seller_id: req.query.seller_id,
      artwork_id: req.query.artwork_id,
      sort: req.query.sort,
    });

    return res.json({ products });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPendingProducts(req, res) {
  try {
    const products = await service.getPendingReviewProducts();

    return res.json({ products });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPrintProviders(req, res) {
  try {
    const providers = await service.listPrintProviders();

    return res.json({ providers });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMySummary(req, res) {
  try {
    const summary = await service.getSellerSummary(req.user.id);

    return res.json({ summary });
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

async function submitForReview(req, res) {
  try {
    const product = await service.submitForReview(req.user.id, req.params.id);

    return res.json({
      message: 'Product submitted for review',
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function moderateProduct(req, res) {
  try {
    const product = await service.moderateProduct(
      req.user.id,
      req.params.id,
      req.body.decision,
      req.body.notes
    );

    return res.json({
      message: 'Moderation decision recorded',
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
  getPendingProducts,
  getPrintProviders,
  getMySummary,
  updateProduct,
  submitForReview,
  moderateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
