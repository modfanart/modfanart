const service = require('./sellerProfile.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function apply(req, res) {
  try {
    const profile = await service.apply(req.user.id, req.body.display_name);

    return res.status(201).json({
      message: 'Seller profile submitted for review',
      profile,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMine(req, res) {
  try {
    const profile = await service.getMine(req.user.id);

    return res.json({ profile: profile || null });
  } catch (error) {
    return handleError(res, error);
  }
}

async function listPending(req, res) {
  try {
    const profiles = await service.listPending();

    return res.json({ profiles });
  } catch (error) {
    return handleError(res, error);
  }
}

async function decide(req, res) {
  try {
    const profile = await service.decide(
      req.user.id,
      req.params.id,
      req.body.status,
      req.body.notes
    );

    return res.json({
      message: 'Seller profile updated',
      profile,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  apply,
  getMine,
  listPending,
  decide,
};
