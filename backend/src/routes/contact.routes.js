// src/routes/contact.routes.js
const express = require('express');
const router = express.Router();

const controller = require('../controller/contactMessage.controller');

router.post('/', controller.createMessage);
router.get('/', controller.getMessages);
router.get('/:id', controller.getMessageById);
router.patch('/:id/read', controller.markAsRead);
router.delete('/:id', controller.deleteMessage);

module.exports = router;