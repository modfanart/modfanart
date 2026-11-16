// src/routes/collections.route.js
const express = require('express');
const router = express.Router();
const CollectionController = require('./controller/collection.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');

// CRUD routes
router.post('/', authenticateToken, CollectionController.createCollection);
router.get('/', CollectionController.getCollections); // ?owner_type=&owner_id=
router.get('/:id', CollectionController.getCollection);
router.put('/:id', authenticateToken, CollectionController.updateCollection);
router.delete('/:id', authenticateToken, CollectionController.deleteCollection);

module.exports = router;
