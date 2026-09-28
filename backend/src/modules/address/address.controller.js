const service = require('./address.service');

function handleError(res, error) {
  console.error(error);

  return res.status(400).json({
    error: error.message || 'Something went wrong',
  });
}

async function listAddresses(req, res) {
  try {
    const addresses = await service.listAddresses(req.user.id);

    return res.json({ addresses });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createAddress(req, res) {
  try {
    const address = await service.createAddress(req.user.id, req.body);

    return res.status(201).json({
      message: 'Address saved',
      address,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateAddress(req, res) {
  try {
    const address = await service.updateAddress(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.json({
      message: 'Address updated',
      address,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteAddress(req, res) {
  try {
    await service.deleteAddress(req.user.id, req.params.id);

    return res.json({ message: 'Address removed' });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
