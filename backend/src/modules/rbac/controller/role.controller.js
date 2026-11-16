// src/modules/rbac/controller/role.controller.js
//
// RBAC API behind the workspace matrix.
//
// Guard rails (none of these existed before):
//   - permissions must be catalog keys, stored as { key: true } (the old
//     workspace modal saved an array, which silently removed every grant)
//   - only a super admin can edit/assign admin-tier roles (ADMIN,
//     SUPER_ADMIN, DEVELOPER) or create a role at/above their own level
//   - non-admin role managers can only grant permissions they hold
//   - you can't change your own role, or remove the last super admin
//   - every change is written to the activity log with before/after values

const { sql } = require('kysely');
const { db } = require('../../../config');
const Role = require('../models/role.model');
const {
  PERMISSION_CATALOG,
  ALL_PERMISSION_KEYS,
  normalisePermissions,
} = require('../../../common/permissions.catalog');
const {
  isAdminUser,
  isSuperAdmin,
  userCan,
  ADMIN_ROLE_NAMES,
  normaliseRole,
} = require('../../../common/middleware/require-admin');
const { record } = require('../../audit/audit.service');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isAdminTierRole = (role) => ADMIN_ROLE_NAMES.includes(normaliseRole(role?.name));

function permsObject(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return normalisePermissions(raw).permissions;
}

function diffPermissions(before, after) {
  const b = new Set(Object.keys(before));
  const a = new Set(Object.keys(after));
  return {
    granted: [...a].filter((k) => !b.has(k)),
    revoked: [...b].filter((k) => !a.has(k)),
  };
}

/** Permissions a non-admin manager may hand out = the ones they hold. */
function ungrantable(reqUser, keys) {
  if (isAdminUser(reqUser)) return [];
  return keys.filter((k) => !userCan(reqUser, k));
}

async function myHierarchy(reqUser) {
  if (!reqUser?.id) return 0;
  const row = await db
    .selectFrom('users as u')
    .leftJoin('roles as r', 'r.id', 'u.role_id')
    .select('r.hierarchy_level')
    .where('u.id', '=', reqUser.id)
    .executeTakeFirst();
  return Number(row?.hierarchy_level ?? 0);
}

class RoleController {
  // GET /roles/permissions  - the catalog the matrix renders
  static async getPermissionCatalog(req, res) {
    res.json({ modules: PERMISSION_CATALOG, keys: ALL_PERMISSION_KEYS });
  }

  // GET /roles/matrix  - roles x permissions + member counts
  static async getMatrix(req, res) {
    try {
      const roles = await db
        .selectFrom('roles as r')
        .leftJoin('users as u', (j) => j.onRef('u.role_id', '=', 'r.id').on('u.deleted_at', 'is', null))
        .select([
          'r.id',
          'r.name',
          'r.hierarchy_level',
          'r.permissions',
          'r.is_system',
          sql`count(u.id)::int`.as('member_count'),
        ])
        .groupBy(['r.id', 'r.name', 'r.hierarchy_level', 'r.permissions', 'r.is_system'])
        .orderBy('r.hierarchy_level', 'desc')
        .orderBy('r.name', 'asc')
        .execute();

      res.json({
        modules: PERMISSION_CATALOG,
        roles: roles.map((r) => ({
          ...r,
          is_admin_tier: isAdminTierRole(r),
          // Admin tier holds everything implicitly; show that in the matrix.
          permissions: isAdminTierRole(r)
            ? Object.fromEntries(ALL_PERMISSION_KEYS.map((k) => [k, true]))
            : permsObject(r.permissions),
          stored_permissions: permsObject(r.permissions),
        })),
        can_edit_admin_roles: isSuperAdmin(req.user),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load the role matrix' });
    }
  }

  // GET /roles
  static async getAllRoles(req, res) {
    try {
      const roles = await db
        .selectFrom('roles')
        .selectAll()
        .orderBy('hierarchy_level', 'desc')
        .orderBy('name', 'asc')
        .execute();
      res.json(roles.map((r) => ({ ...r, permissions: permsObject(r.permissions) })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to list roles' });
    }
  }

  // GET /roles/:id/members
  static async getMembers(req, res) {
    try {
      if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Role not found' });
      const members = await db
        .selectFrom('users')
        .select(['id', 'username', 'email', 'avatar_url', 'status', 'last_login_at'])
        .where('role_id', '=', req.params.id)
        .where('deleted_at', 'is', null)
        .orderBy('username')
        .limit(500)
        .execute();
      res.json({ members });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load members' });
    }
  }

  // POST /roles
  static async createRole(req, res) {
    try {
      const name = normaliseRole(req.body?.name);
      const hierarchy = Number(req.body?.hierarchy_level);
      if (!name || !/^[A-Z][A-Z0-9_]{1,49}$/.test(name)) {
        return res.status(400).json({ error: 'Role name must be 2-50 letters, numbers or underscores' });
      }
      if (!Number.isFinite(hierarchy) || hierarchy < 0 || hierarchy > 100) {
        return res.status(400).json({ error: 'hierarchy_level must be a number from 0 to 100' });
      }
      if (ADMIN_ROLE_NAMES.includes(name)) {
        return res.status(400).json({ error: 'That name is reserved for admin-tier roles' });
      }
      if (!isSuperAdmin(req.user) && hierarchy >= (await myHierarchy(req.user))) {
        return res.status(403).json({ error: 'You can only create roles below your own level' });
      }
      const { permissions, unknown } = normalisePermissions(req.body?.permissions);
      if (unknown.length) return res.status(400).json({ error: 'Unknown permissions', unknown });
      const blocked = ungrantable(req.user, Object.keys(permissions));
      if (blocked.length) {
        return res.status(403).json({ error: "You can't grant permissions you don't have", permissions: blocked });
      }
      if (await Role.findByName(name)) {
        return res.status(409).json({ error: 'Role name already exists' });
      }

      const role = await db
        .insertInto('roles')
        .values({
          name,
          hierarchy_level: hierarchy,
          permissions: JSON.stringify(permissions),
          is_system: false,
          created_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirst();

      await record({
        req,
        action: 'role.created',
        entityType: 'role',
        entityId: role.id,
        after: { name, hierarchy_level: hierarchy, permissions: Object.keys(permissions) },
        summary: `Created role ${name} with ${Object.keys(permissions).length} permission(s)`,
        statusCode: 201,
      });

      res.status(201).json({ ...role, permissions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  // PATCH /roles/:id   { name?, hierarchy_level?, permissions? }
  static async updateRole(req, res) {
    try {
      const { id } = req.params;
      if (!UUID_RE.test(id)) return res.status(404).json({ error: 'Role not found' });
      const existing = await Role.findById(id);
      if (!existing) return res.status(404).json({ error: 'Role not found' });

      if (isAdminTierRole(existing) && !isSuperAdmin(req.user)) {
        return res.status(403).json({ error: 'Only a super admin can edit admin-tier roles' });
      }
      if (isAdminTierRole(existing) && req.body?.permissions !== undefined) {
        return res.status(400).json({ error: 'Admin-tier roles hold every permission; there is nothing to edit' });
      }

      const before = {
        name: existing.name,
        hierarchy_level: existing.hierarchy_level,
        permissions: permsObject(existing.permissions),
      };
      const patch = {};

      if (req.body?.name !== undefined) {
        const name = normaliseRole(req.body.name);
        if (existing.is_system && name !== existing.name) {
          return res.status(403).json({ error: 'System roles cannot be renamed' });
        }
        if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(name)) {
          return res.status(400).json({ error: 'Role name must be 2-50 letters, numbers or underscores' });
        }
        if (name !== existing.name && ADMIN_ROLE_NAMES.includes(name)) {
          return res.status(400).json({ error: 'That name is reserved for admin-tier roles' });
        }
        if (name !== existing.name && (await Role.findByName(name))) {
          return res.status(409).json({ error: 'Role name already exists' });
        }
        patch.name = name;
      }

      if (req.body?.hierarchy_level !== undefined) {
        const h = Number(req.body.hierarchy_level);
        if (!Number.isFinite(h) || h < 0 || h > 100) {
          return res.status(400).json({ error: 'hierarchy_level must be a number from 0 to 100' });
        }
        if (!isSuperAdmin(req.user) && h >= (await myHierarchy(req.user))) {
          return res.status(403).json({ error: 'You can only set levels below your own' });
        }
        patch.hierarchy_level = h;
      }

      let change = { granted: [], revoked: [] };
      if (req.body?.permissions !== undefined) {
        const { permissions, unknown } = normalisePermissions(req.body.permissions);
        if (unknown.length) return res.status(400).json({ error: 'Unknown permissions', unknown });
        change = diffPermissions(before.permissions, permissions);
        const blocked = ungrantable(req.user, [...change.granted, ...change.revoked]);
        if (blocked.length) {
          return res.status(403).json({ error: "You can't change permissions you don't have", permissions: blocked });
        }
        patch.permissions = JSON.stringify(permissions);
      }

      if (!Object.keys(patch).length) return res.status(400).json({ error: 'No fields to update' });

      const updated = await db
        .updateTable('roles')
        .set({ ...patch, updated_at: sql`NOW()` })
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirst();

      const after = {
        name: updated.name,
        hierarchy_level: updated.hierarchy_level,
        permissions: permsObject(updated.permissions),
      };
      const parts = [];
      if (change.granted.length) parts.push(`granted ${change.granted.join(', ')}`);
      if (change.revoked.length) parts.push(`revoked ${change.revoked.join(', ')}`);
      if (patch.name && patch.name !== before.name) parts.push(`renamed from ${before.name}`);
      if (patch.hierarchy_level !== undefined && patch.hierarchy_level !== before.hierarchy_level)
        parts.push(`level ${before.hierarchy_level} → ${patch.hierarchy_level}`);

      await record({
        req,
        action: change.granted.length || change.revoked.length ? 'role.permissions_updated' : 'role.updated',
        entityType: 'role',
        entityId: id,
        before: { ...before, permissions: Object.keys(before.permissions) },
        after: { ...after, permissions: Object.keys(after.permissions), ...change },
        summary: `${updated.name}: ${parts.join('; ') || 'no effective change'}`,
        statusCode: 200,
      });

      res.json({ ...updated, permissions: after.permissions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }

  // DELETE /roles/:id   (non-system, unused roles only)
  static async deleteRole(req, res) {
    try {
      const { id } = req.params;
      if (!UUID_RE.test(id)) return res.status(404).json({ error: 'Role not found' });
      const role = await Role.findById(id);
      if (!role) return res.status(404).json({ error: 'Role not found' });
      if (role.is_system || isAdminTierRole(role)) {
        return res.status(403).json({ error: 'System and admin-tier roles cannot be deleted' });
      }
      const inUse = await db.selectFrom('users').select('id').where('role_id', '=', id).limit(1).executeTakeFirst();
      if (inUse) {
        return res.status(409).json({ error: 'Move the members of this role to another role first' });
      }
      await db.deleteFrom('roles').where('id', '=', id).execute();
      await record({
        req,
        action: 'role.deleted',
        entityType: 'role',
        entityId: id,
        before: { name: role.name, permissions: Object.keys(permsObject(role.permissions)) },
        summary: `Deleted role ${role.name}`,
        statusCode: 204,
      });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }

  // POST /roles/users/:userId/roles   { roleId }
  static async assignRoleToUser(req, res) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body || {};
      if (!UUID_RE.test(String(userId)) || !UUID_RE.test(String(roleId))) {
        return res.status(400).json({ error: 'userId and roleId must be valid ids' });
      }
      if (userId === req.user.id) {
        return res.status(403).json({ error: "You can't change your own role" });
      }

      const target = await db
        .selectFrom('users as u')
        .leftJoin('roles as r', 'r.id', 'u.role_id')
        .select(['u.id', 'u.username', 'u.email', 'u.role_id', 'r.name as role_name'])
        .where('u.id', '=', userId)
        .executeTakeFirst();
      if (!target) return res.status(404).json({ error: 'User not found' });

      const role = await Role.findById(roleId);
      if (!role) return res.status(404).json({ error: 'Role not found' });

      const touchesAdminTier = isAdminTierRole(role) || isAdminTierRole({ name: target.role_name });
      if (touchesAdminTier && !isSuperAdmin(req.user)) {
        return res.status(403).json({ error: 'Only a super admin can grant or remove admin-tier roles' });
      }

      // Never leave the platform without a super admin.
      const wasSuper = ['SUPER_ADMIN', 'SUPERADMIN'].includes(normaliseRole(target.role_name));
      const staysSuper = ['SUPER_ADMIN', 'SUPERADMIN'].includes(normaliseRole(role.name));
      if (wasSuper && !staysSuper) {
        const { n } = await db
          .selectFrom('users as u')
          .innerJoin('roles as r', 'r.id', 'u.role_id')
          .select(sql`count(*)::int`.as('n'))
          .where(sql`upper(r.name)`, 'in', ['SUPER_ADMIN', 'SUPERADMIN'])
          .where('u.deleted_at', 'is', null)
          .executeTakeFirst();
        if (n <= 1) return res.status(409).json({ error: 'This is the last super admin; assign another first' });
      }

      if (!isAdminUser(req.user)) {
        const blocked = ungrantable(req.user, Object.keys(permsObject(role.permissions)));
        if (blocked.length) {
          return res.status(403).json({ error: "You can't assign a role with permissions you don't have", permissions: blocked });
        }
      }

      await db.updateTable('users').set({ role_id: roleId, updated_at: sql`NOW()` }).where('id', '=', userId).execute();

      await record({
        req,
        action: 'user.role_changed',
        entityType: 'user',
        entityId: userId,
        before: { role: target.role_name },
        after: { role: role.name },
        summary: `${target.username || target.email}: ${target.role_name || 'no role'} → ${role.name}`,
        statusCode: 200,
      });

      res.json({ message: `Role ${role.name} assigned`, roleId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
}

module.exports = RoleController;
