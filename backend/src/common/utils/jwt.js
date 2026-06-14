// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // same as your NextAuth maxAge
    ...options,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
};
