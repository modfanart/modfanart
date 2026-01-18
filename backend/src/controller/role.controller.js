// src/controllers/role.controller.js
const Role = require('../models/role.model');
const User = require('../models/user.model');
const { sql } = require('kysely');

class RoleController {
  // ────────────────────────────────────────────────
  // Admin: List all roles
  // GET /roles
  static async getAllRoles(req, res) {
    try {
      const roles = await db
        .selectFrom('roles')
        .selectAll()
        .orderBy('hierarchy_level', 'desc')
        .orderBy('name', 'asc')
        .execute();

      res.json(roles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to list roles' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Create new role
  // POST /roles
  static async createRole(req, res) {
    try {
      const { name, hierarchy_level, permissions = {}, is_system = false } = req.body;

      if (!name || typeof hierarchy_level !== 'number') {
        return res.status(400).json({ error: 'name and hierarchy_level are required' });
      }

      // Prevent duplicate name
      if (await Role.findByName(name)) {
        return res.status(409).json({ error: 'Role name already exists' });
      }

      const role = await db
        .insertInto('roles')
        .values({
          name,
          hierarchy_level,
          permissions: permissions || {},
          is_system: !!is_system,
          created_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirst();

      res.status(201).json(role);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Update role (name, hierarchy, permissions)
  // PATCH /roles/:id
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, hierarchy_level, permissions, is_system } = req.body;

      const existing = await Role.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Role not found' });
      }

      if (existing.is_system && req.body.is_system === false) {
        return res.status(403).json({ error: 'Cannot change system role flag' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (hierarchy_level !== undefined) updateData.hierarchy_level = hierarchy_level;
      if (permissions !== undefined) updateData.permissions = permissions;
      if (is_system !== undefined) updateData.is_system = !!is_system;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updated = await db
        .updateTable('roles')
        .set({ ...updateData, updated_at: sql`NOW()` })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Delete role (only non-system & not in use)
  // DELETE /roles/:id
  static async deleteRole(req, res) {
    try {
      const { id } = req.params;

      const role = await Role.findById(id);
      if (!role) return res.status(404).json({ error: 'Role not found' });

      if (role.is_system) {
        return res.status(403).json({ error: 'Cannot delete system role' });
      }

      // Check if any user uses this role
      const usersWithRole = await db
        .selectFrom('users')
        .select('id')
        .where('role_id', '=', id)
        .limit(1)
        .execute();

      if (usersWithRole.length > 0) {
        return res.status(409).json({ error: 'Cannot delete role — users are still assigned to it' });
      }

      await db.deleteFrom('roles').where('id', '=', id).execute();

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin / Moderator: Assign role to user
  // POST /users/:userId/roles
  static async assignRoleToUser(req, res) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const role = await Role.findById(roleId);
      if (!role) return res.status(404).json({ error: 'Role not found' });

      // Optional: prevent downgrading higher hierarchy roles (safety)
      const currentRole = await Role.findById(user.role_id);
      if (currentRole && currentRole.hierarchy_level > role.hierarchy_level) {
        return res.status(403).json({ error: 'Cannot assign lower hierarchy role' });
      }

      // Simple version: replace single role
      await User.update(userId, {
        role_id: roleId,
        updated_at: sql`NOW()`,
      });

      // Future multi-role version would insert into user_roles instead

      res.json({ message: `Role ${role.name} assigned to user`, roleId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
}

module.exports = RoleController;