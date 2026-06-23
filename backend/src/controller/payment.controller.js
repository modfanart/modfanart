// backend/src/controllers/payment.controller.js
const {
  createPayment,
  getPaymentById,
  getPaymentsByUserId,
  updatePaymentStatus,
} = require('../models/payment');

async function createPaymentHandler(req, res, next) {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

async function getPaymentByIdHandler(req, res, next) {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

async function getPaymentsByUserIdHandler(req, res, next) {
  try {
    const payments = await getPaymentsByUserId(req.params.userId);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
}

async function updatePaymentStatusHandler(req, res, next) {
  try {
    const { status, metadata } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const payment = await updatePaymentStatus(req.params.id, status, metadata || {});
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPaymentHandler,
  getPaymentByIdHandler,
  getPaymentsByUserIdHandler,
  updatePaymentStatusHandler,
};