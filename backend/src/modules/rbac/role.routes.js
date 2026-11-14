// src/routes/role.routes.js
const express = require('express');
const RoleController = require('./controller/role.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
const {
  hasPermission,
  hasAnyPermission,
} = require('../../common/middleware/permission.middleware');

const { requireAdmin } = require('../../common/middleware/require-admin');

const router = express.Router();

// SECURITY: every role endpoint was unauthenticated -> anyone could create a
// role with all permissions and assign it to themselves. Admin-only now.
router.use(authenticateToken, requireAdmin);

router.get('/', RoleController.getAllRoles);
router.post('/', RoleController.createRole);
router.patch('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

router.post('/users/:userId/roles', RoleController.assignRoleToUser);

module.exports = router;
