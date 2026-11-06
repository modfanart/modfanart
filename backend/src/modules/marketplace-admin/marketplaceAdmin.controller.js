const service = require('./marketplaceAdmin.service');

function fail(res, error) {
  console.error(error);

  return res.status(400).json({ error: error.message || 'Something went wrong' });
}

const wrap = (fn, key, status = 200) => async (req, res) => {
  try {
    const result = await fn(req);

    return res.status(status).json(key ? { [key]: result } : result);
  } catch (error) {
    return fail(res, error);
  }
};

module.exports = {
  listProducts: wrap((req) => service.listProducts({ ...req.query, sellerId: req.query.seller_id })),
  setProductStatus: wrap(
    async (req) => ({ product: await service.setProductStatus(req.params.id, req.body.status) })
  ),

  listSellers: wrap((req) => service.listSellers(req.query), 'sellers'),
  setSellerStatus: wrap(
    async (req) => ({
      profile: await service.setSellerStatus(req.user.id, req.params.id, req.body.status, req.body.notes),
    })
  ),

  listFeeRules: wrap(() => service.listFeeRules(), 'rules'),
  createFeeRule: wrap(async (req) => ({ rule: await service.createFeeRule(req.body || {}) }), null, 201),
  updateFeeRule: wrap(async (req) => ({ rule: await service.updateFeeRule(req.params.id, req.body || {}) })),

  listPrintProviders: wrap(() => service.listPrintProviders(), 'providers'),
  createPrintProvider: wrap(
    async (req) => ({ provider: await service.createPrintProvider(req.body || {}) }),
    null,
    201
  ),
  updatePrintProvider: wrap(
    async (req) => ({ provider: await service.updatePrintProvider(req.params.id, req.body || {}) })
  ),

  cancelOrder: wrap(async (req) => ({ order: await service.cancelOrder(req.params.id) })),

  listReviews: wrap((req) => service.listReviews(req.query), 'reviews'),
  removeReview: wrap(async (req) => ({ removed: await service.removeReview(req.params.id) })),
};
