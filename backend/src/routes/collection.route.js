// src/routes/collections.route.js
const express = require('express');
const router = express.Router();
const CollectionController = require('../controller/collection.controller');

// CRUD routes
router.post('/', CollectionController.createCollection);
router.get('/', CollectionController.getCollections); // ?owner_type=&owner_id=
router.get('/:id', CollectionController.getCollection);
router.put('/:id', CollectionController.updateCollection);
router.delete('/:id', CollectionController.deleteCollection);

module.exports = router;
