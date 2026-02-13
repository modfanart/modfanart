// src/routes/category.routes.js
const express = require('express');
const CategoryController = require('../controller/category.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

const router = express.Router();

// Public routes (read-only)
router.get('/', CategoryController.getAllCategories);
router.get('/:identifier', CategoryController.getCategory);
router.get('/slug/:slug', CategoryController.getCategoryBySlug);
// Admin-only routes (create/update/delete)
// router.use(authenticateToken);
router.use(hasPermission('categories.manage'));

router.post('/', CategoryController.createCategory);
router.patch('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;