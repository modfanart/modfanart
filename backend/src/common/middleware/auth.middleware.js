const admin = require('../../config/firebase');
const { db } = require('../../config');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Load user + role in one query, matched by Firebase UID
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
        'r.name as role',
        'r.permissions as role_permissions',
      ])
      .where('u.firebase_uid', '=', decoded.uid)
      .where('u.status', '=', 'active')
      .where('u.deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) {
      return res.status(403).json({ error: 'User not found. Call /api/auth/sync first.' });
    }

    let brands = [];

    const BRAND_ROLES = ['BRAND_OWNER', 'BRAND_MANAGER', 'BRAND_EDITOR', 'BRAND_MEMBER'];
    const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

    if (BRAND_ROLES.includes(user.role) || ADMIN_ROLES.includes(user.role)) {
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
            eb('b.user_id', '=', user.id),
            eb('bm.user_id', '=', user.id),
          ])
        )
        .execute();
    } else {
      brands = await db
        .selectFrom('brands')
        .select(['id', 'name', 'slug', 'logo_url', 'banner_url', 'status'])
        .where('user_id', '=', user.id)
        .execute();
    }

    user.permissions = user.role_permissions || {};
    user.brands = brands || [];

    delete user.role_permissions;
    delete user.role_id;

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

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
