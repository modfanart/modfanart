const admin = require('../../../config/firebase');
const { db } = require('../../../config');
const { sql } = require('kysely');
const User = require('../../users/models/user.model');
const Role = require('../../rbac/models/role.model');

const ACCOUNT_TYPE_ROLE_NAMES = {
  fan: 'DEFAULT_USER',
  artist: 'ARTIST',
  brand: 'BRAND_MANAGER',
};

// Matches the signup form: 3-30 characters, letters, numbers and underscores.
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

async function findSignupRole(accountType) {
  const roleName =
    ACCOUNT_TYPE_ROLE_NAMES[accountType] || ACCOUNT_TYPE_ROLE_NAMES.fan;

  return Role.findByName(roleName);
}

class AuthController {
  /**
   * POST /auth/sync
   *
   * Used after:
   *  - Firebase Email/Password login
   *  - Firebase Google login
   *
   * Firebase is responsible for authentication.
   * Our DB is responsible for application user/account data.
   */
  static async sync(req, res) {
    try {
      // --------------------------------------------------
      // 1. Extract Firebase ID token
      // --------------------------------------------------

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No valid authorization token provided',
        });
      }

      const token = authHeader.substring(7);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided',
        });
      }

      // --------------------------------------------------
      // 2. Verify token with Firebase
      // --------------------------------------------------

      const decoded = await admin.auth().verifyIdToken(token);

      const {
        uid: firebaseUid,
        email,
        picture,
        email_verified: firebaseEmailVerified,
      } = decoded;

      if (!firebaseUid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Firebase token',
        });
      }

      // --------------------------------------------------
      // 3. Find existing user
      // --------------------------------------------------

      let user = await User.findByFirebaseUid(firebaseUid);

      // --------------------------------------------------
      // 4. Existing account without firebase_uid
      //
      // This handles accounts that already exist in your
      // database and are now logging in through Firebase.
      // --------------------------------------------------

      if (!user && email) {
        user = await User.findByEmail(email);

        if (user) {
          await db
            .updateTable('users')
            .set({
              firebase_uid: firebaseUid,
              updated_at: sql`NOW()`,
            })
            .where('id', '=', user.id)
            .execute();

          user.firebase_uid = firebaseUid;
        }
      }

      // A user who has since clicked the verification link carries email_verified=true in
      // their token. Record it; never downgrade (grandfathered accounts stay verified).
      if (user && firebaseEmailVerified === true && !user.email_verified) {
        await db
          .updateTable('users')
          .set({ email_verified: true })
          .where('id', '=', user.id)
          .execute();
      }

      // --------------------------------------------------
      // 5. New Firebase user
      //
      // Don't create the DB account until the frontend
      // tells us what account type they selected.
      // --------------------------------------------------

      if (!user) {
        const accountType = req.body?.accountType;

        if (!accountType) {
          return res.status(200).json({
            success: true,
            user: null,
            isNewUser: true,
            requiresSignup: true,
          });
        }

        if (!ACCOUNT_TYPE_ROLE_NAMES[accountType]) {
          return res.status(400).json({
            success: false,
            error: 'Invalid account type',
          });
        }

        if (!email) {
          return res.status(400).json({
            success: false,
            error: 'Firebase account does not contain an email address',
          });
        }

        // Accounts are only created with explicit acceptance of the Terms of Service and
        // Privacy Policy; the signup form sends this from its required checkbox.
        if (req.body?.acceptedTerms !== true) {
          return res.status(400).json({
            success: false,
            error: 'You must accept the Terms of Service and Privacy Policy',
            code: 'TERMS_NOT_ACCEPTED',
          });
        }

        // --------------------------------------------------
        // 6. Resolve role
        // --------------------------------------------------

        const signupRole = await findSignupRole(accountType);

        if (!signupRole) {
          throw new Error(
            `Default role not found for account type: ${accountType}`
          );
        }

        // --------------------------------------------------
        // 7. Generate username
        // --------------------------------------------------

        let username = req.body?.username?.trim().toLowerCase();
        const usernameWasChosen = Boolean(username);

        if (usernameWasChosen && !USERNAME_PATTERN.test(username)) {
          return res.status(400).json({
            success: false,
            error:
              'Usernames are 3-30 characters: letters, numbers and underscores only',
            code: 'INVALID_USERNAME',
          });
        }

        if (!username) {
          const base =
            email
              .split('@')[0]
              .replace(/[^a-z0-9_]/gi, '')
              .toLowerCase() || 'user';

          username = base;
        }

        // --------------------------------------------------
        // 8. Ensure username uniqueness
        // --------------------------------------------------

        const originalUsername = username;

        let usernameExists = await User.findByUsername(username);

        // A username the person typed must not be silently changed to a suffixed variant;
        // tell them it is taken so they can pick another. Generated ones (Google signups)
        // still get a random suffix below.
        if (usernameExists && usernameWasChosen) {
          return res.status(409).json({
            success: false,
            error: 'That username is already taken',
            code: 'USERNAME_TAKEN',
          });
        }

        while (usernameExists) {
          username = `${originalUsername}_${Math.random()
            .toString(36)
            .slice(2, 7)}`;

          usernameExists = await User.findByUsername(username);
        }

        // --------------------------------------------------
        // 9. Create DB user
        // --------------------------------------------------

        user = await User.create({
          firebase_uid: firebaseUid,
          username,
          email,
          avatar_url: picture || null,
          role_id: signupRole.id,
          status: 'active',
          // Only Firebase can vouch for the address: Google accounts arrive verified,
          // email/password accounts are unverified until the link is clicked.
          email_verified: firebaseEmailVerified === true,
          terms_accepted_at: sql`NOW()`,
        });
      }

      // --------------------------------------------------
      // 10. Update last login
      // --------------------------------------------------

      await db
        .updateTable('users')
        .set({
          last_login_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', user.id)
        .execute();

      // --------------------------------------------------
      // 11. Fetch complete application user
      // --------------------------------------------------

      const fullUser = await db
        .selectFrom('users as u')
        .leftJoin('roles as r', 'r.id', 'u.role_id')
        .select([
          'u.id',
          'u.username',
          'u.email',
          'u.avatar_url',
          'u.status',
          'u.email_verified',
          'u.last_login_at',

          'r.id as role_id',
          'r.name as role',
          'r.permissions as permissions',
        ])
        .where('u.id', '=', user.id)
        .executeTakeFirst();

      if (!fullUser) {
        throw new Error('User was created but could not be retrieved');
      }

      // --------------------------------------------------
      // 12. Load brands for brand managers/admins
      // --------------------------------------------------

      let brands = [];

      const normalizedRole = String(fullUser.role || '').toUpperCase();

      if (normalizedRole === 'BRAND_MANAGER' || normalizedRole === 'ADMIN') {
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

      // --------------------------------------------------
      // 13. Return application session data
      // --------------------------------------------------

      return res.status(200).json({
        success: true,
        user: {
          ...fullUser,
          brands,
        },
        isNewUser: false,
        requiresSignup: false,
      });
    } catch (err) {
      console.error('Auth sync error:', err);

      // Firebase token errors
      if (
        err?.code === 'auth/id-token-expired' ||
        err?.code === 'auth/id-token-revoked' ||
        err?.code === 'auth/argument-error'
      ) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired authentication token',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Auth sync failed',
      });
    }
  }
}

module.exports = AuthController;
