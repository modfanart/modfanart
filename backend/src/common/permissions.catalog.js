// src/common/permissions.catalog.js
//
// The complete list of permission keys the API checks, grouped by module for
// the workspace RBAC matrix. A role's `permissions` column is an object of
// { "<key>": true }. Keys not in this catalog are rejected on save, so a typo
// in the matrix can't silently grant nothing.
//
// Admin-tier roles (ADMIN, SUPER_ADMIN/SUPERADMIN, DEVELOPER) implicitly hold
// every permission (see require-admin.js).

const PERMISSION_CATALOG = [
  {
    module: 'workspace',
    label: 'Workspace',
    permissions: [
      { key: 'workspace.access', label: 'Sign in to the workspace', description: 'Required for any non-admin staff role to use the workspace app.' },
    ],
  },
  {
    module: 'admin',
    label: 'Admin console',
    permissions: [
      { key: 'users.view', label: 'View users', description: 'List and search all user accounts.' },
      { key: 'users.manage', label: 'Manage users', description: 'Edit, suspend, ban or delete user accounts.' },
      { key: 'roles.view', label: 'View roles & permissions', description: 'See the RBAC matrix.' },
      { key: 'roles.manage', label: 'Manage roles & permissions', description: 'Create roles, change permissions, assign roles to users.' },
      { key: 'audit.view', label: 'View activity logs', description: 'Read the staff and system activity trail.' },
      { key: 'queries.manage', label: 'Manage contact queries', description: 'Read and resolve contact-form messages.' },
    ],
  },
  {
    module: 'brands',
    label: 'Brands',
    permissions: [
      { key: 'brands.manage', label: 'Manage brands', description: 'Create and edit any brand.' },
      { key: 'brands.verify', label: 'Verify brands', description: 'Approve or reject brand verification requests.' },
    ],
  },
  {
    module: 'campaigns',
    label: 'Campaigns & contests',
    permissions: [
      { key: 'contests.manage', label: 'Manage contests', description: 'Create, edit, publish and close any contest.' },
      { key: 'contests.moderate', label: 'Moderate entries', description: 'Approve, reject or disqualify contest entries.' },
      { key: 'contests.judge', label: 'Judge contests', description: 'Score entries on contests the user is assigned to.' },
      { key: 'contests.view_scores', label: 'View judge scores', description: 'See individual judge scores and comments.' },
      { key: 'prizes.manage', label: 'Manage prizes', description: 'Mark contest prizes funded, paid or cancelled.' },
    ],
  },
  {
    module: 'catalog',
    label: 'Artworks & catalog',
    permissions: [
      { key: 'artworks.manage', label: 'Manage artworks', description: 'Edit or remove any artwork.' },
      { key: 'categories.manage', label: 'Manage categories', description: 'Create and edit categories.' },
      { key: 'tags.manage', label: 'Manage tags', description: 'Create, merge and delete tags.' },
    ],
  },
  {
    module: 'licensing',
    label: 'Licensing',
    permissions: [
      { key: 'licenses.view_all', label: 'View all licenses', description: 'See every issued license.' },
      { key: 'licenses.manage', label: 'Manage licenses', description: 'Revoke or amend issued licenses.' },
    ],
  },
  {
    module: 'marketplace',
    label: 'Marketplace',
    permissions: [
      { key: 'merch.moderate', label: 'Moderate products', description: 'Approve, reject or archive merch listings.' },
      { key: 'sellers.manage', label: 'Manage sellers', description: 'Approve seller applications, suspend sellers.' },
      { key: 'marketplace.manage', label: 'Marketplace settings', description: 'Fee rules, print providers, reviews, cancelling orders.' },
      { key: 'orders.view_all', label: 'View all orders', description: 'See every marketplace order.' },
      { key: 'orders.confirm', label: 'Confirm orders', description: 'Confirm or update order fulfilment.' },
      { key: 'orders.create', label: 'Create manual orders', description: 'Create orders on behalf of customers.' },
    ],
  },
  {
    module: 'finance',
    label: 'Finance',
    permissions: [
      { key: 'payouts.view', label: 'View payouts', description: 'See all seller and artist payouts.' },
      { key: 'payouts.manage', label: 'Prepare payouts', description: 'Generate payouts and mark them failed.' },
      { key: 'payouts.approve', label: 'Approve payouts', description: 'Mark payouts paid (second-person approval).' },
      { key: 'disputes.view', label: 'View disputes', description: 'See chargebacks and their outcomes.' },
    ],
  },
  {
    module: 'agenda',
    label: 'Agenda (tasks & projects)',
    permissions: [
      { key: 'projects.manage', label: 'Manage projects', description: 'Create projects and manage members.' },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.flatMap((m) => m.permissions.map((p) => p.key));
const KEY_SET = new Set(ALL_PERMISSION_KEYS);

/**
 * Accepts { key: true } or ["key", ...] (what the old workspace modal sent)
 * and returns a clean { key: true } object plus any unknown keys.
 */
function normalisePermissions(input) {
  const keys = Array.isArray(input)
    ? input
    : Object.entries(input || {})
        .filter(([, v]) => v === true)
        .map(([k]) => k);
  const unknown = keys.filter((k) => !KEY_SET.has(k));
  const permissions = {};
  for (const k of keys) if (KEY_SET.has(k)) permissions[k] = true;
  return { permissions, unknown };
}

module.exports = { PERMISSION_CATALOG, ALL_PERMISSION_KEYS, normalisePermissions };
