// backend/src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const {
  createPaymentHandler,
  getPaymentByIdHandler,
  getPaymentsByUserIdHandler,
  updatePaymentStatusHandler,
} = require('../controllers/payment.controller');

// POST /api/payments
router.post('/', createPaymentHandler);

// GET /api/payments/:id
router.get('/:id', getPaymentByIdHandler);

// GET /api/payments/user/:userId
router.get('/user/:userId', getPaymentsByUserIdHandler);

// PATCH /api/payments/:id/status
router.patch('/:id/status', updatePaymentStatusHandler);

module.exports = router;