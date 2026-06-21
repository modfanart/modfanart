const admin = require('../../../config/firebase');
const { db } = require('../../../config');
const { sql } = require('kysely');
const User = require('../../users/models/user.model');
const Role = require('../../rbac/models/role.model');

class AuthController {
  /**
   * POST /api/auth/sync
   *
   * Called by the frontend after every Firebase sign-in.
   * Verifies the Firebase ID token, then finds or creates the user
   * record in our DB. Returns the full user profile with role + brands.
   *
   * Body (optional, used only on first sign-up):
   *   { username?: string }
   */
  static async sync(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = await admin.auth().verifyIdToken(token);
      const { uid: firebaseUid, email, name: displayName, picture } = decoded;

      // 1. Find by firebase_uid
      let user = await User.findByFirebaseUid(firebaseUid);

      // 2. Migration path: existing user registered before Firebase
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

      // 3. New user — create DB record
      if (!user) {
        const defaultRole = await Role.findByName('user');
        if (!defaultRole) throw new Error('Default role not found');

        // Derive username: use provided value, or generate from email prefix
        let username = req.body?.username?.trim().toLowerCase();
        if (!username) {
          const base = email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();
          username = base;
        }

        // Ensure username is unique — append random suffix if taken
        const taken = await User.findByUsername(username);
        if (taken) {
          username = `${username}_${Math.random().toString(36).slice(2, 6)}`;
        }

        user = await User.create({
          firebase_uid: firebaseUid,
          username,
          email,
          avatar_url: picture || null,
          role_id: defaultRole.id,
          status: 'active',
          email_verified: true,
        });
      }

      // 4. Update last_login
      await db
        .updateTable('users')
        .set({ last_login_at: sql`NOW()` })
        .where('id', '=', user.id)
        .execute();

      // 5. Load role + brands for response
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
            eb.or([
              eb('b.user_id', '=', user.id),
              eb('bm.user_id', '=', user.id),
            ])
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
