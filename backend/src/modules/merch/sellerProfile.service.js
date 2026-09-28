const model = require('./models/sellerProfile.model');

async function apply(userId, displayName) {
  if (!displayName) {
    throw new Error('Display name is required');
  }

  const existing = await model.findByUser(userId);

  if (existing) {
    throw new Error('You already have a seller profile');
  }

  return model.create({ user_id: userId, display_name: displayName });
}

async function getMine(userId) {
  return model.findByUser(userId);
}

async function listPending() {
  return model.findPending();
}

async function decide(reviewerId, profileId, status, notes) {
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    throw new Error('Invalid decision');
  }

  return model.decide(profileId, { reviewerId, status, notes });
}

module.exports = {
  apply,
  getMine,
  listPending,
  decide,
};
