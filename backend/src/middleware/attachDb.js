// src/middleware/attachDb.js   (or db.middleware.js)
const { db } = require('../config'); // ← your Kysely instance

module.exports = function attachDb(req, res, next) {
  req.db = db;
  next();
};
