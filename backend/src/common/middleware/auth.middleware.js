const admin = require('../../config/firebase');
const { db } = require('../../config');
const jwt = require('jsonwebtoken');
const { isAdminUser } = require('./require-admin');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // GA-10: the admin app may sign in with a workspace JWT (staff only,
    // 15-minute expiry, issued by /api/auth/workspace/login). Anything else
    // must be a Firebase ID token.
    let workspaceUserId = null;
    const wsSecret = process.env.WORKSPACE_JWT_ACCESS_SECRET;
    if (wsSecret && token.split('.').length === 3) {
      try {
        const payload = jwt.verify(token, wsSecret, { algorithms: ['HS256'] });
        if (payload?.type === 'workspace' && payload.sub) workspaceUserId = payload.sub;
      } catch {
        /* not a workspace token - fall through to Firebase */
      }
    }
    const decoded = workspaceUserId
      ? { uid: null, email_verified: true }
      : await admin.auth().verifyIdToken(token);

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
        'u.email_verified',
        'u.accepted_terms_version',
        'u.age_confirmed_at',
        'r.name as role',
        'r.permissions as role_permissions',
      ])
      .where(workspaceUserId ? 'u.id' : 'u.firebase_uid', '=', workspaceUserId ?? decoded.uid)
      .where('u.status', '=', 'active')
      .where('u.deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) {
      return res
        .status(403)
        .json({ error: 'User not found. Call /api/auth/sync first.' });
    }

    if (workspaceUserId && !isAdminUser(user)) {
      return res.status(403).json({ error: 'Staff accounts only' });
    }

    let brands = [];

    const BRAND_ROLES = [
      'BRAND_OWNER',
      'BRAND_MANAGER',
      'BRAND_EDITOR',
      'BRAND_MEMBER',
    ];
    // Role names differ between environments (SUPERADMIN vs SUPER_ADMIN).
    const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'DEVELOPER'];

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
          eb.or([eb('b.user_id', '=', user.id), eb('bm.user_id', '=', user.id)])
        )
        .execute();
    } else {
      brands = await db
        .selectFrom('brands')
        .select(['id', 'name', 'slug', 'logo_url', 'banner_url', 'status'])
        .where('user_id', '=', user.id)
        .execute();
    }

    // Firebase is the source of truth for verification (the DB copy is only
    // refreshed on /auth/sync). Google sign-ins arrive verified.
    user.email_verified = decoded.email_verified === true || user.email_verified === true;

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
