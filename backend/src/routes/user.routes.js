// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
  createUserHandler,
  getUserByIdHandler,
  getUserByEmailHandler,
  updateUserHandler,
  deleteUserHandler,
} = require('../controllers/user.controller');

// POST /api/users
router.post('/', createUserHandler);

// GET /api/users/:id
router.get('/:id', getUserByIdHandler);

// GET /api/users?email=...
router.get('/', getUserByEmailHandler);

// PATCH /api/users/:id
router.patch('/:id', updateUserHandler);

// DELETE /api/users/:id
router.delete('/:id', deleteUserHandler);

module.exports = router;