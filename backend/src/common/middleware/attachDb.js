// src/common/middleware/attachDb.js
const { db } = require('../../config');

module.exports = function attachDb(req, res, next) {
  if (!req.db) {
    req.db = db;
  }
  next();
};
