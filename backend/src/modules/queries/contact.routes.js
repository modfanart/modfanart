// src/routes/contact.routes.js
const express = require('express');
const router = express.Router();

const controller = require('./controller/contactMessage.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { requireAdmin } = require('../../common/middleware/require-admin');
const adminOnly = [authenticateToken, requireAdmin];

router.post('/', controller.createMessage);
router.get('/', ...adminOnly, controller.getMessages);
router.get('/:id', ...adminOnly, controller.getMessageById);
router.patch('/:id/read', ...adminOnly, controller.markAsRead);
router.delete('/:id', ...adminOnly, controller.deleteMessage);

module.exports = router;
