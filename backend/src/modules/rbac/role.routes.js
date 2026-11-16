// src/modules/rbac/role.routes.js  ->  /api/roles
const express = require('express');
const RoleController = require('./controller/role.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const { requirePermission } = require('../../common/middleware/require-admin');

const router = express.Router();

// Was fully unauthenticated, then admin-only. Now permission based so a
// staff role can be given read-only or full access to RBAC.
router.use(authenticateToken);

const view = requirePermission('roles.view');
const manage = requirePermission('roles.manage');

router.get('/permissions', view, RoleController.getPermissionCatalog);
router.get('/matrix', view, RoleController.getMatrix);
router.get('/', view, RoleController.getAllRoles);
router.get('/:id/members', view, RoleController.getMembers);

router.post('/', manage, RoleController.createRole);
router.patch('/:id', manage, RoleController.updateRole);
router.delete('/:id', manage, RoleController.deleteRole);
router.post('/users/:userId/roles', manage, RoleController.assignRoleToUser);

module.exports = router;
