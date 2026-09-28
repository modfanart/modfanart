const { db } = require('../../config');
const model = require('./models/address.model');

const REQUIRED_FIELDS = ['full_name', 'line1', 'city', 'postal_code', 'country'];

function validate(payload) {
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      throw new Error(`${field} is required`);
    }
  }

  if (!/^[A-Z]{2}$/.test(payload.country)) {
    throw new Error('Country must be an ISO 3166-1 alpha-2 code, e.g. IN, US');
  }
}

async function createAddress(userId, payload) {
  validate(payload);

  return db.transaction().execute(async (trx) => {
    const isFirstAddress = (await model.findByUser(userId, trx)).length === 0;
    const makeDefault = Boolean(payload.is_default) || isFirstAddress;

    if (makeDefault) {
      await model.clearDefaultForUser(userId, trx);
    }

    return model.createAddress(
      {
        user_id: userId,
        full_name: payload.full_name,
        phone: payload.phone || null,
        line1: payload.line1,
        line2: payload.line2 || null,
        city: payload.city,
        state: payload.state || null,
        postal_code: payload.postal_code,
        country: payload.country,
        is_default: makeDefault,
      },
      trx
    );
  });
}

async function listAddresses(userId) {
  return model.findByUser(userId);
}

async function updateAddress(userId, addressId, payload) {
  const address = await model.findById(addressId);

  if (!address || address.user_id !== userId) {
    throw new Error('Address not found');
  }

  const merged = { ...address, ...payload };
  validate(merged);

  return db.transaction().execute(async (trx) => {
    if (payload.is_default) {
      await model.clearDefaultForUser(userId, trx);
    }

    return model.updateAddress(
      addressId,
      {
        full_name: merged.full_name,
        phone: merged.phone || null,
        line1: merged.line1,
        line2: merged.line2 || null,
        city: merged.city,
        state: merged.state || null,
        postal_code: merged.postal_code,
        country: merged.country,
        is_default: Boolean(payload.is_default) || address.is_default,
      },
      trx
    );
  });
}

async function deleteAddress(userId, addressId) {
  const address = await model.findById(addressId);

  if (!address || address.user_id !== userId) {
    throw new Error('Address not found');
  }

  return model.softDelete(addressId);
}

module.exports = {
  createAddress,
  listAddresses,
  updateAddress,
  deleteAddress,
};
