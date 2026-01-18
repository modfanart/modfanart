// src/routes/role.routes.js
const express = require('express');
const RoleController = require('../controller/role.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission, hasAnyPermission } = require('../middleware/permission.middleware');

const router = express.Router();

// All role management routes require authentication + admin-level permission
// router.use(authenticateToken);

// You can later tighten this with proper admin role check
// For now we assume anyone with "roles.manage" can do everything
router.use(hasPermission('roles.manage'));

router.get('/', RoleController.getAllRoles);
router.post('/', RoleController.createRole);
router.patch('/:id', RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

// User role assignment
router.post('/users/:userId/roles', RoleController.assignRoleToUser);

module.exports = router;