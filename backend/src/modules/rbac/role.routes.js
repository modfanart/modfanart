// src/routes/role.routes.js
const express = require("express");
const RoleController = require("./controller/role.controller");
const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");
const {
  hasPermission,
  hasAnyPermission,
} = require("../../common/middleware/permission.middleware");

const router = express.Router();

router.get("/", RoleController.getAllRoles);
router.post("/", RoleController.createRole);
router.patch("/:id", RoleController.updateRole);
router.delete("/:id", RoleController.deleteRole);

router.post("/users/:userId/roles", RoleController.assignRoleToUser);

module.exports = router;
