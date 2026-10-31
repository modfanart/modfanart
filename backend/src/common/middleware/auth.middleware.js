const admin = require('../../config/firebase');
const { db } = require('../../config');

const BRAND_ROLES = ['BRAND_OWNER', 'BRAND_MANAGER', 'BRAND_EDITOR', 'BRAND_MEMBER'];
const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

function bearerToken(req) {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
}

/**
 * Verifies a Firebase ID token and loads the matching active user, role and brands.
 * Resolves to null when the token is valid but no local account exists yet; throws when
 * the token itself is invalid or expired.
 */
async function loadUserFromToken(token) {
  const decoded = await admin.auth().verifyIdToken(token);

  // Load user + role in one query, matched by Firebase UID
  const user = await db
    .selectFrom('users as u')
    .leftJoin('roles as r', 'r.id', 'u.role_id')
    .select([
      'u.id',
      'u.username',
      'u.email',
      'u.email_verified',
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

  if (!user) return null;

  // Firebase is the source of truth for verification. A user who clicked the link gets
  // email_verified=true in their next ID token, so record it here rather than waiting for
  // the next /auth/sync. Never flips true back to false (grandfathered accounts stay verified).
  if (decoded.email_verified === true && !user.email_verified) {
    await db
      .updateTable('users')
      .set({ email_verified: true })
      .where('id', '=', user.id)
      .execute();
    user.email_verified = true;
  }

  let brands = [];

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

  user.permissions = user.role_permissions || {};
  user.brands = brands || [];

  delete user.role_permissions;
  delete user.role_id;

  return user;
}

async function authenticateToken(req, res, next) {
  const token = bearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await loadUserFromToken(token);

    if (!user) {
      return res
        .status(403)
        .json({ error: 'User not found. Call /api/auth/sync first.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * For public routes that personalise their response when the caller is signed in
 * (e.g. "is this my own profile"). Attaches req.user when a valid token is sent and
 * carries on anonymously otherwise — a bad token must not turn a public page into an error.
 */
async function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return next();

  try {
    const user = await loadUserFromToken(token);
    if (user) req.user = user;
  } catch (err) {
    // Treat an invalid/expired token as anonymous on public routes.
  }

  next();
}

/**
 * Blocks accounts that have not confirmed their email address. Must run after
 * authenticateToken. The frontend keys off `code` to send the user to /verify-account.
 */
function requireVerifiedEmail(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  if (!req.user.email_verified) {
    return res.status(403).json({
      error: 'Please verify your email address before doing this.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
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

module.exports = { authenticateToken, optionalAuth, requireVerifiedEmail, authorize };
