const User = require("../../users/models/user.model");
const Role = require("../../rbac/models/role.model");
const RefreshToken = require("../models/refreshToken.model");
const AuthToken = require("../models/authToken.model");

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
  fan: ["fan", "user"],
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
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      const storedToken = await db
        .selectFrom("refresh_tokens")
        .selectAll()
        .where("token_hash", "=", refreshHash)
        .where("revoked_at", "is", null)
        .where("expires_at", ">", sql`NOW()`)
        .executeTakeFirst();

      if (!storedToken) {
        return res
          .status(403)
          .json({ error: "Invalid or expired refresh token" });
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || user.status !== "active") {
        return res.status(403).json({ error: "User not found or inactive" });
      }

      const newAccessToken = generateAccessToken({ userId: user.id });

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(403).json({ error: "Token refresh failed" });
    }
  }

  // POST /auth/forgot-password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        // Security: don't reveal if email exists
        return res.json({
          message: "If the email exists, a reset link has been sent.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await AuthToken.create(
        user.id,
        "password_reset",
        tokenHash,
        new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      );

      await EmailService.sendPasswordResetEmail(user, token);
      res.json({ message: "Password reset link sent to email." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error processing request" });
    }
  }

  // POST /auth/reset-password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: "Token and new password required" });
      }

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const authToken = await AuthToken.findValid(tokenHash, "password_reset");

      if (!authToken) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const passwordHash = await hashPassword(newPassword);

      await User.update(authToken.user_id, {
        password_hash: passwordHash,
      });

      await AuthToken.markAsUsed(authToken.id);

      // Optional: revoke all refresh tokens
      await RefreshToken.revokeAllForUser(authToken.user_id);

      res.json({ message: "Password reset successful. Please log in." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Password reset failed" });
    }
  }

  // POST /auth/logout
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body; // optional

      if (refreshToken) {
        const refreshHash = crypto
          .createHash("sha256")
          .update(refreshToken)
          .digest("hex");

        // Revoke specific token if provided and valid
        const tokenRecord = await db
          .selectFrom("refresh_tokens")
          .select("id")
          .where("token_hash", "=", refreshHash)
          .where("revoked_at", "is", null)
          .executeTakeFirst();

        if (tokenRecord) {
          await RefreshToken.revoke(tokenRecord.id);
          console.log(
            `Refresh token revoked for logout: ${refreshHash.substring(
              0,
              8
            )}...`
          );
        }
      }

      // You could also revoke ALL refresh tokens for the user (more aggressive)
      // But requires authenticated request → needs access token validation first
      // Example (if you want this behavior):
      /*
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token); // your util
        await RefreshToken.revokeAllForUser(decoded.userId);
      } catch {}
    }
    */

      // Always return success — client clears local state anyway
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Still return 200 — client should clear tokens regardless
      res.status(200).json({
        success: true,
        message: "Logged out (partial server cleanup)",
      });
    }
  }
}

module.exports = AuthController;
