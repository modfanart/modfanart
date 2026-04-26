const { verifyAccessToken } = require('../utils/jwt.util');
const { db } = require('../config');
const { sql } = require('kysely');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyAccessToken(token);

    // Load user + role in one query
    const user = await db
      .selectFrom('users as u')
      .leftJoin('roles as r', 'r.id', 'u.role_id')
      .select([
        'u.id',
        'u.username',
        'u.email',
        'u.avatar_url',
        'u.status',
        'u.role_id',
        'r.name as role', // e.g. "brand_manager"
        'r.permissions as role_permissions', // ← Correct column
      ])
      .where('u.id', '=', decoded.userId)
      .where('u.status', '=', 'active')
      .executeTakeFirst();

    if (!user) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    // Load brands this user owns OR manages
    let brands = [];

    // For brand_manager or Admin, fetch brands they own or manage
    if (user.role === 'brand_manager' || user.role === 'Admin') {
      brands = await db
        .selectFrom('brands as b')
        .leftJoin('brand_managers as bm', 'bm.brand_id', 'b.id')
        .select([
          'b.id',
          'b.name',
          'b.slug',
          'b.logo_url',
          'b.banner_url',
          'b.status',
          'b.user_id as owner_id',
        ])
        .where((eb) =>
          eb.or([
            eb('b.user_id', '=', user.id), // Brand owner
            eb('bm.user_id', '=', user.id), // Brand manager
          ])
        )
        .execute();
    } else {
      // Regular user who owns brands
      brands = await db
        .selectFrom('brands')
        .select(['id', 'name', 'slug', 'logo_url', 'banner_url', 'status'])
        .where('user_id', '=', user.id)
        .execute();
    }

    // Merge role permissions into user object
    user.permissions = user.role_permissions || {};

    // Attach brands
    user.brands = brands || [];

    // Clean up temporary fields
    delete user.role_permissions;
    delete user.role_id;

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Optional role-based middleware
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = { authenticateToken, authorize };
