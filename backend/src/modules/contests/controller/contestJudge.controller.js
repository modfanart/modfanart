// src/controllers/contestJudge.controller.js
const Contest = require("../models/contest.model");
const ContestJudge = require("../models/contestJudge.model");
const JudgeInviteToken = require("../models/judgeInviteToken.model");
const User = require("../../users/models/user.model");
const { db } = require("../../../config");
const { sql } = require("kysely");
const sgMail = require("../../../config/sendgrid");

class ContestJudgeController {
  /**
   * Who may manage a contest's judges: a platform admin, or someone who owns
   * or manages the brand running the contest.
   *
   * `contests.brand_id` references `brands.id`, and `user.brands` holds the
   * brand rows the caller owns or manages, so `brandMatch` is the check that
   * does the work. `ownerMatch` covers older databases where `brand_id`
   * referenced `users.id` instead; it is a no-op against the current schema.
   *
   * Role names are SCREAMING_SNAKE_CASE (ADMIN, SUPERADMIN, BRAND_OWNER, ...)
   * and are the same vocabulary auth.middleware.js checks against.
   */
  /**
   * Postgres raises 22P02 on a malformed uuid, which surfaced as an opaque
   * 500. Callers should get a 400 telling them the id is wrong.
   */
  static isUuid(value) {
    return (
      typeof value === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    );
  }

  static canManageContest(user, contest) {
    if (!user || !contest) return false;

    const isPlatformAdmin = ["ADMIN", "SUPERADMIN"].includes(user.role);
    const brandMatch = (user.brands || []).some(
      (b) => String(b.id) === String(contest.brand_id)
    );
    const ownerMatch = String(contest.brand_id) === String(user.id);

    return isPlatformAdmin || brandMatch || ownerMatch;
  }

  /**
   * POST /contest/:contestId/judges
   * Assign / Invite a user as judge
   */
  static async assignJudge(req, res) {
    try {
      const { contestId } = req.params;
      const { judgeId } = req.body;

      if (!judgeId) {
        return res.status(400).json({ error: "judgeId is required" });
      }

      if (!ContestJudgeController.isUuid(contestId)) {
        return res.status(400).json({ error: "Invalid contest id" });
      }

      if (!ContestJudgeController.isUuid(judgeId)) {
        return res.status(400).json({ error: "Invalid judge id" });
      }

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      const user = req.user;

      if (!ContestJudgeController.canManageContest(user, contest)) {
        console.log("Authorization failed for user:", {
          userId: user?.id,
          userRole: user?.role,
          contestBrandId: contest.brand_id,
          userBrands: user?.brands?.map((b) => b.id),
        });

        return res.status(403).json({
          error: "Not authorized",
          message:
            "Only the brand owner, brand manager for this brand, or admin can assign judges",
        });
      }

      // === Rest of the logic ===
      const judge = await db
        .selectFrom("users as u")
        .leftJoin("roles as r", "r.id", "u.role_id")
        .select([
          "u.id",
          "u.username",
          "u.avatar_url",
          "u.profile",
          "u.status",
          "r.name as role",
          "r.permissions as permissions",
        ])
        .where("u.id", "=", judgeId)
        // Deleted and suspended accounts were assignable as judges, which gave
        // scoring access to an account the platform has already shut off.
        .where("u.deleted_at", "is", null)
        .executeTakeFirst();
      if (!judge) {
        return res.status(404).json({ error: "User not found" });
      }

      if (judge.status !== "active") {
        return res.status(400).json({
          error: "That account is not active and cannot be assigned as a judge",
        });
      }



      if (["judging", "completed", "archived"].includes(contest.status)) {
        return res.status(400).json({
          error:
            "Cannot assign judges after contest has entered judging or completed phase",
        });
      }

      // Check if already assigned
      const existing = await db
        .selectFrom("contest_judges")
        .select("judge_id")
        .where("contest_id", "=", contestId)
        .where("judge_id", "=", judgeId)
        .executeTakeFirst();

      if (existing) {
        return res.status(409).json({
          error: "User is already assigned as a judge for this contest",
        });
      }

      const assignment = await db
        .insertInto("contest_judges")
        .values({
          contest_id: contestId,
          judge_id: judgeId,
          invited_by: user.id,
          accepted: false,
          created_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .returningAll()
        .executeTakeFirst();

      res.status(201).json({
        success: true,
        message: "Judge invited successfully",
        data: {
          user_id: judgeId,
          judge_id: judgeId,
          username: judge.username,
          name: judge.profile?.full_name || judge.profile?.name || null,
          avatar_url: judge.avatar_url,
          accepted: false,
          assigned_at: assignment.created_at,
        },
      });
    } catch (err) {
      console.error("ASSIGN JUDGE ERROR:", err);
      res.status(500).json({
        error: "Failed to assign judge",
        ...(process.env.NODE_ENV !== "production" && {
          detail: err.message,
          code: err.code,
        }),
      });
    }
  }
  static async getPendingInvitations(req, res) {
    try {
      const judgeId = req.user.id;

      const contests = await db
        .selectFrom("contest_judges as cj")
        .innerJoin("contests as c", "c.id", "cj.contest_id")
        .select([
          "c.id",
          "c.title",
          "c.slug",
          "c.description",
          "c.status",
          "c.start_date",
          "c.submission_end_date",
          "c.judging_end_date",
          "cj.created_at as invited_at",
        ])
        .where("cj.judge_id", "=", judgeId)
        .where("cj.accepted", "=", false)
        .where("c.deleted_at", "is", null)
        .orderBy("cj.created_at", "desc")
        .execute();

      res.json({
        success: true,
        contests,
      });
    } catch (err) {
      console.error("GET PENDING INVITES ERROR:", err);
      res.status(500).json({ error: "Failed to fetch invitations" });
    }
  }

  /**
   * GET /contest/:contestId/judges
   */
  static async getJudges(req, res) {
    try {
      const { contestId } = req.params;

      const judges = await db
        .selectFrom("contest_judges as cj")
        .innerJoin("users as u", "u.id", "cj.judge_id")
        .select([
          "cj.judge_id as user_id",
          "u.username",
          sql`COALESCE(
          u.profile->>'full_name',
          u.profile->>'name',
          u.username
        ) as name`,
          "u.avatar_url",
          "cj.accepted",
          "cj.invited_by",
          "cj.created_at as assigned_at",
          "cj.updated_at", // ← optional
        ])
        .where("cj.contest_id", "=", contestId)
        // Deleted accounts should not keep appearing on the judges roster.
        .where("u.deleted_at", "is", null)
        .orderBy("cj.created_at", "desc") // Now safe after adding column
        .execute();

      res.json({
        success: true,
        judges,
      });
    } catch (err) {
      console.error("GET JUDGES ERROR:", err);
      res.status(500).json({
        error: "Failed to fetch judges for contest",
        ...(process.env.NODE_ENV !== "production" && {
          detail: err.message,
        }),
      });
    }
  }

  /**
   * PATCH /contest/:contestId/judges/:judgeId/accept
   */
  static async acceptInvitation(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      if (judgeId !== req.user?.id) {
        return res
          .status(403)
          .json({ error: "This invitation is not for you" });
      }

      const assignment = await db
        .updateTable("contest_judges")
        .set({ accepted: true })
        .where("contest_id", "=", contestId)
        .where("judge_id", "=", judgeId)
        .where("accepted", "=", false)
        .returningAll()
        .executeTakeFirst();

      if (!assignment) {
        return res.status(404).json({
          error: "Invitation not found or already accepted",
        });
      }

      res.json({
        success: true,
        message: "Judge invitation accepted successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to accept judge invitation" });
    }
  }

  /**
   * DELETE /contest/:contestId/judges/:judgeId
   */
  static async removeJudge(req, res) {
    try {
      const { contestId, judgeId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      // This was the fifth copy of the authorization logic and the one place
      // the shared helper was not applied. All three of its checks failed
      // against the real schema: "Admin" never matches the ADMIN role,
      // permissions is {} on every role, and brand_id is a brands.id being
      // compared to a users.id. The result was a 403 for every caller,
      // including SUPERADMIN, so no judge could be removed from any contest.
      if (!ContestJudgeController.canManageContest(req.user, contest)) {
        return res
          .status(403)
          .json({ error: "Not authorized to remove judges" });
      }

      if (contest.status === "judging") {
        return res.status(400).json({
          error: "Cannot remove judges while contest is in judging phase",
        });
      }

      const deleted = await db
        .deleteFrom("contest_judges")
        .where("contest_id", "=", contestId)
        .where("judge_id", "=", judgeId)
        .returning(["judge_id"])
        .executeTakeFirst();

      if (!deleted) {
        return res.status(404).json({ error: "Judge assignment not found" });
      }

      res.json({
        success: true,
        message: "Judge removed successfully",
        judgeId,
      });
    } catch (err) {
      console.error("REMOVE JUDGE ERROR:", err);
      res.status(500).json({ error: "Failed to remove judge" });
    }
  }

  /**
   * GET /contest/judge/contests
   */
  static async getAllContestsByJudgeId(req, res) {
    try {
      const judgeId = req.user.id;

      const contests = await db
        .selectFrom("contest_judges as cj")
        .innerJoin("contests as c", "c.id", "cj.contest_id")
        .select([
          "c.id",
          "c.title",
          "c.slug",
          "c.description",
          "c.status",
          "c.start_date",
          "c.submission_end_date",
          "c.judging_end_date",
          "c.created_at",
          "c.brand_id",
        ])
        .where("cj.judge_id", "=", judgeId)
        .where("cj.accepted", "=", true)
        .where("c.deleted_at", "is", null)
        .orderBy("c.created_at", "desc")
        .execute();

      res.json({
        success: true,
        contests,
      });
    } catch (err) {
      console.error("GET JUDGE CONTESTS ERROR:", err);
      res.status(500).json({ error: "Failed to fetch assigned contests" });
    }
  }

  /**
   * POST /contest/:contestId/judges/:judgeId/invite-link
   * Brand owner/manager/admin only — generates a fresh one-time invite
   * link for an already-assigned judge and emails it via SendGrid.
   * Regenerating invalidates any previously unused link for the same pair.
   */
  static async generateInviteLink(req, res) {
    try {
      const { contestId, judgeId } = req.params;
      const user = req.user;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (!ContestJudgeController.canManageContest(user, contest)) {
        return res.status(403).json({
          error: "Not authorized",
          message: "Only the brand owner, brand manager, or admin can generate judge invite links",
        });
      }

      // Same guard the other two link generators and assignJudge already
      // apply. Without it a fresh 7-day invite could be minted for a contest
      // that has already finished judging.
      if (["judging", "completed", "archived"].includes(contest.status)) {
        return res.status(400).json({
          error:
            "Cannot generate a judge invite link after the contest has entered judging or completed phase",
        });
      }

      const assignment = await db
        .selectFrom("contest_judges")
        .select("judge_id")
        .where("contest_id", "=", contestId)
        .where("judge_id", "=", judgeId)
        .executeTakeFirst();

      if (!assignment) {
        return res.status(404).json({
          error: "This user is not assigned as a judge for this contest yet — assign them first",
        });
      }

      const judge = await db
        .selectFrom("users")
        .select(["id", "username", "email"])
        .where("id", "=", judgeId)
        .executeTakeFirst();

      if (!judge) {
        return res.status(404).json({ error: "Judge user not found" });
      }

      const invite = await JudgeInviteToken.create(contestId, judgeId, user.id);
      const inviteUrl = `${process.env.FRONTEND_URL}/judge/invite/${invite.token}`;

      // Best-effort email — a failure here shouldn't block returning the
      // link itself, since the brand manager can still copy/share it manually.
      let emailSent = false;
      if (process.env.SENDGRID_API_KEY && judge.email) {
        try {
          await sgMail.send({
            to: judge.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: `You've been invited to judge: ${contest.title}`,
            text:
              `You've been invited to judge "${contest.title}".\n\n` +
              `This link is single-use and expires in 7 days:\n${inviteUrl}\n\n` +
              `If you weren't expecting this, you can ignore this email.`,
            html:
              `<p>You've been invited to judge <strong>${contest.title}</strong>.</p>` +
              `<p><a href="${inviteUrl}">Click here to accept and open the judging dashboard</a></p>` +
              `<p style="color:#666;font-size:13px">This link is single-use and expires in 7 days. If you weren't expecting this, you can ignore this email.</p>`,
          });
          emailSent = true;
        } catch (emailErr) {
          console.error("JUDGE INVITE EMAIL ERROR:", emailErr);
        }
      }

      res.status(201).json({
        success: true,
        invite_url: inviteUrl,
        expires_at: invite.expires_at,
        email_sent: emailSent,
      });
    } catch (err) {
      console.error("GENERATE INVITE LINK ERROR:", err);
      res.status(500).json({ error: "Failed to generate invite link" });
    }
  }

  /**
   * POST /contest/:contestId/judges/self-assign-link
   * Generates a contest-level, shareable link. It isn't tied to a known
   * user up front — whoever opens it (after logging in / signing up)
   * claims it and becomes an assigned judge for this contest, then can
   * reuse the same link to get back into their dashboard.
   */
  static async generateSelfAssignLink(req, res) {
    try {
      const { contestId } = req.params;
      const user = req.user;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (!ContestJudgeController.canManageContest(user, contest)) {
        return res.status(403).json({
          error: "Not authorized",
          message: "Only the brand owner, brand manager, or admin can generate a judging link",
        });
      }

      if (["judging", "completed", "archived"].includes(contest.status)) {
        return res.status(400).json({
          error: "Cannot generate a judging link after the contest has entered judging or completed phase",
        });
      }

      const invite = await JudgeInviteToken.createSelfAssign(contestId, user.id);
      const inviteUrl = `${process.env.FRONTEND_URL}/judge/invite/${invite.token}`;

      res.status(201).json({
        success: true,
        invite_url: inviteUrl,
        expires_at: invite.expires_at,
      });
    } catch (err) {
      console.error("GENERATE SELF-ASSIGN LINK ERROR:", err);
      res.status(500).json({ error: "Failed to generate judging link" });
    }
  }

  /**
   * POST /contest/:contestId/judges/open-link
   * Generates a reusable, contest-level link that multiple different
   * people can each self-assign from — every distinct authenticated
   * account that opens it becomes an assigned judge, with no cap and no
   * per-account locking. This is what the "Generate Judging Link" button
   * uses by default.
   */
  static async generateOpenLink(req, res) {
    try {
      const { contestId } = req.params;
      const user = req.user;

      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (!ContestJudgeController.canManageContest(user, contest)) {
        return res.status(403).json({
          error: "Not authorized",
          message: "Only the brand owner, brand manager, or admin can generate a judging link",
        });
      }

      if (["judging", "completed", "archived"].includes(contest.status)) {
        return res.status(400).json({
          error: "Cannot generate a judging link after the contest has entered judging or completed phase",
        });
      }

      const invite = await JudgeInviteToken.createOpen(contestId, user.id);
      const inviteUrl = `${process.env.FRONTEND_URL}/judge/invite/${invite.token}`;

      res.status(201).json({
        success: true,
        invite_url: inviteUrl,
        expires_at: invite.expires_at,
      });
    } catch (err) {
      console.error("GENERATE OPEN LINK ERROR:", err);
      res.status(500).json({ error: "Failed to generate judging link" });
    }
  }

  /**
   * POST /contest/judge-invite/:token/redeem
   * Requires auth (the router applies authenticateToken globally). Handles
   * both invite types:
   *  - direct: the logged-in user must be the exact judge the token was
   *    issued to.
   *  - self_assign: the logged-in user claims the token on first redeem,
   *    or is confirmed as its existing owner on a repeat visit.
   * Single-use per recipient: the underlying UPDATEs only match an
   * unused/unclaimed, unexpired row, so concurrent/duplicate calls can't
   * double-redeem or double-claim.
   */
  static async redeemInviteLink(req, res) {
    try {
      const { token } = req.params;
      const userId = req.user.id;

      const existing = await JudgeInviteToken.findByToken(token);
      if (!existing) {
        return res.status(404).json({ error: "invalid_token", message: "This invite link is invalid." });
      }

      // findByToken never looks at the contest, so a link kept working after
      // its contest was deleted and inserted judges into the dead contest.
      const contest = await Contest.findById(existing.contest_id);
      if (!contest) {
        return res.status(410).json({
          error: "contest_unavailable",
          message: "The contest for this invite link is no longer available.",
        });
      }

      if (existing.type === "open") {
        const row = await JudgeInviteToken.redeemOpen(token);

        if (!row) {
          if (new Date(existing.expires_at) <= new Date()) {
            return res.status(410).json({ error: "expired", message: "This invite link has expired." });
          }
          return res.status(410).json({ error: "invalid_token", message: "This invite link is no longer active." });
        }

        await ContestJudge.assign(row.contest_id, userId, row.invited_by);
        await ContestJudge.acceptInvitation(row.contest_id, userId);

        const judge = await db
          .selectFrom("users")
          .select("username")
          .where("id", "=", userId)
          .executeTakeFirst();

        return res.json({
          success: true,
          contest_id: row.contest_id,
          redirect_to: `/judge/${judge.username?.toLowerCase()}/contest/${row.contest_id}`,
        });
      }

      if (existing.type === "self_assign") {
        const result = await JudgeInviteToken.redeemSelfAssign(token, userId);

        if (!result) {
          if (existing.judge_id && existing.judge_id !== userId) {
            return res.status(403).json({
              error: "wrong_account",
              message: "This invite link has already been claimed by a different account.",
            });
          }
          if (new Date(existing.expires_at) <= new Date()) {
            return res.status(410).json({ error: "expired", message: "This invite link has expired." });
          }
          return res.status(410).json({ error: "invalid_token", message: "This invite link is invalid." });
        }

        const { row } = result;

        await ContestJudge.assign(row.contest_id, userId, row.invited_by);
        await ContestJudge.acceptInvitation(row.contest_id, userId);

        const judge = await db
          .selectFrom("users")
          .select("username")
          .where("id", "=", userId)
          .executeTakeFirst();

        return res.json({
          success: true,
          contest_id: row.contest_id,
          redirect_to: `/judge/${judge.username?.toLowerCase()}/contest/${row.contest_id}`,
        });
      }

      const row = await JudgeInviteToken.redeem(token, userId);

      if (!row) {
        // Distinguish "doesn't exist" from "exists but not redeemable by you"
        // for a clearer error, without leaking whether a token exists to
        // someone it wasn't issued to.
        if (existing.judge_id !== userId) {
          return res.status(403).json({ error: "wrong_account", message: "This invite link was issued to a different account." });
        }
        if (existing.used_at) {
          return res.status(410).json({ error: "already_used", message: "This invite link has already been used." });
        }
        return res.status(410).json({ error: "expired", message: "This invite link has expired." });
      }

      await ContestJudge.acceptInvitation(row.contest_id, row.judge_id);

      const judge = await db
        .selectFrom("users")
        .select("username")
        .where("id", "=", row.judge_id)
        .executeTakeFirst();

      res.json({
        success: true,
        contest_id: row.contest_id,
        redirect_to: `/judge/${judge.username?.toLowerCase()}/contest/${row.contest_id}`,
      });
    } catch (err) {
      console.error("REDEEM INVITE LINK ERROR:", err);
      res.status(500).json({ error: "Failed to redeem invite link" });
    }
  }
}

module.exports = ContestJudgeController;