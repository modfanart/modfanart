const admin = require('../../../config/firebase');
const { db } = require('../../../config');
const { sql } = require('kysely');
const User = require('../../users/models/user.model');
const Role = require('../../rbac/models/role.model');

const {
  hashPassword,
  comparePassword,
} = require("../../../common/utils/password.util");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../../common/utils/jwt.util");

const crypto = require("crypto");
const { sql } = require("kysely");
const { z } = require("zod");
const { db } = require("../../../config");
// Helpers (you can move to utils/email.util.js later)
const EmailService = require("../../../common/emails/email.service");

const ACCOUNT_TYPE_ROLE_NAMES = {
  fan: ["fan", "DEFAULT_USER", "default_user", "user"],
  artist: ["Artist", "artist", "creator", "user"],
  brand: [
    "Brand",
    "brand",
    "brand_owner",
    "brand-manager",
    "brand manager",
    "brand_manager",
    "user",
  ],
};

const registerSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  email: z
    .string()
    .trim()
    .email("Valid email is required")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
  accountType: z.enum(["fan", "artist", "brand"]).default("fan"),
});

async function findSignupRole(accountType) {
  const roleNames = ACCOUNT_TYPE_ROLE_NAMES[accountType];

  for (const roleName of roleNames) {
    const role = await Role.findByName(roleName);
    if (role) return role;
  }

  return db
    .selectFrom("roles")
    .selectAll()
    .where(
      sql`LOWER(name)`,
      "in",
      roleNames.map((roleName) => roleName.toLowerCase())
    )
    .executeTakeFirst();
}

class AuthController {
  // POST /auth/register
  static async register(req, res) {
    try {
      const parsed = registerSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid registration data",
          details: z.treeifyError(parsed.error).properties,
        });
      }

      const { username, email, password, accountType } = parsed.data;

      // Only supported public account types can be selected at signup.
      if (!ACCOUNT_TYPE_ROLE_NAMES[accountType]) {
        return res.status(400).json({ error: "Invalid account type" });
      }

      // Check existing user
      if (await User.findByEmail(email)) {
        return res.status(409).json({ error: "Email already in use" });
      }
      if (await User.findByUsername(username)) {
        return res.status(409).json({ error: "Username taken" });
      }

      const passwordHash = await hashPassword(password);

      // Prefer the account-specific role, with "user" as a temporary fallback.
      const signupRole = await findSignupRole(accountType);
      if (!signupRole) {
        throw new Error("Default user role not found");
      }

      const user = await User.create({
        username,
        email,
        password_hash: passwordHash,
        role_id: signupRole.id,
        status: "pending_verification",
      });

      // Create email verification token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await AuthToken.create(
        user.id,
        "email_verification",
        tokenHash,
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
      );

      let verificationEmailSent = true;
      try {
        await EmailService.sendVerificationEmail(user, token);
      } catch (emailError) {
        verificationEmailSent = false;
        console.error("Registration email failed:", emailError.message);
      }

      res.status(201).json({
        message: "User registered. Please check your email to verify.",
        userId: user.id,
        verificationEmailSent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  // GET /auth/verify-email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: "Missing token" });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const authToken = await AuthToken.findValid(
        tokenHash,
        "email_verification"
      );

      if (!authToken) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      await User.update(authToken.user_id, {
        email_verified: true,
        status: "active",
      });
      await AuthToken.markAsUsed(authToken.id);

      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Verification failed" });
    }
  }

  // POST /auth/login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const user = await User.findByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      console.log(user);
      if (user.status !== "active") {
        return res.status(403).json({ error: `Account is ${user.status}` });
      }

      const passwordMatch = await comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      const accessToken = generateAccessToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Store refresh token hash
      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      await RefreshToken.create(
        user.id,
        refreshHash,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      );

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  // POST /auth/refresh
  static async refreshToken(req, res) {
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
