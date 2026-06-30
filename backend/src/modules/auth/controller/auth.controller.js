const admin = require('../../../config/firebase');
const { db } = require('../../../config');
const { sql } = require('kysely');
const User = require('../../users/models/user.model');
const Role = require('../../rbac/models/role.model');

const ACCOUNT_TYPE_ROLE_NAMES = {
  fan: ['fan', 'DEFAULT_USER', 'default_user', 'user'],
  artist: ['Artist', 'artist', 'creator', 'user'],
  brand: ['Brand', 'brand', 'brand_owner', 'brand-manager', 'brand manager', 'brand_manager', 'user'],
};

async function findSignupRole(accountType) {
  const roleNames = ACCOUNT_TYPE_ROLE_NAMES[accountType] || ACCOUNT_TYPE_ROLE_NAMES.fan;
  for (const roleName of roleNames) {
    const role = await Role.findByName(roleName);
    if (role) return role;
  }
  return db
    .selectFrom('roles')
    .selectAll()
    .where(sql`LOWER(name)`, 'in', roleNames.map((n) => n.toLowerCase()))
    .executeTakeFirst();
}

class AuthController {
  static async sync(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = await admin.auth().verifyIdToken(token);
      const { uid: firebaseUid, email, picture } = decoded;

      let user = await User.findByFirebaseUid(firebaseUid);

      if (!user && email) {
        user = await User.findByEmail(email);
        if (user) {
          await db
            .updateTable('users')
            .set({ firebase_uid: firebaseUid, updated_at: sql`NOW()` })
            .where('id', '=', user.id)
            .execute();
          user.firebase_uid = firebaseUid;
        }
      }

      if (!user) {
        const accountType = req.body?.accountType;
        if (!accountType) {
          return res.json({ user: null, isNewUser: true });
        }

        const signupRole = await findSignupRole(accountType);
        if (!signupRole) throw new Error('Default role not found in DB');

        let username = req.body?.username?.trim().toLowerCase();
        if (!username) {
          const base = email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();
          username = base;
        }

        const taken = await User.findByUsername(username);
        if (taken) username = `${username}_${Math.random().toString(36).slice(2, 6)}`;

        user = await User.create({
          firebase_uid: firebaseUid,
          username,
          email,
          avatar_url: picture || null,
          role_id: signupRole.id,
          status: 'active',
          email_verified: true,
        });
      }

      await db
        .updateTable('users')
        .set({ last_login_at: sql`NOW()` })
        .where('id', '=', user.id)
        .execute();

      const fullUser = await db
        .selectFrom('users as u')
        .leftJoin('roles as r', 'r.id', 'u.role_id')
        .select([
          'u.id',
          'u.username',
          'u.email',
          'u.avatar_url',
          'u.status',
          'r.name as role',
          'r.permissions as permissions',
        ])
        .where('u.id', '=', user.id)
        .executeTakeFirst();

      let brands = [];
      if (fullUser.role === 'brand_manager' || fullUser.role === 'Admin') {
        brands = await db
          .selectFrom('brands as b')
          .leftJoin('brand_managers as bm', 'bm.brand_id', 'b.id')
          .select(['b.id', 'b.name', 'b.slug', 'b.logo_url', 'b.status'])
          .where((eb) =>
            eb.or([eb('b.user_id', '=', user.id), eb('bm.user_id', '=', user.id)])
          )
          .execute();
      }

      res.json({ user: { ...fullUser, brands } });
    } catch (err) {
      console.error('Sync error:', err);
      res.status(500).json({ error: 'Auth sync failed' });
    }
  }
}

module.exports = AuthController;
