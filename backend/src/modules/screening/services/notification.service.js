// Telling the artist what happened.
//
// Called by the worker after a decision has already been committed, which is why nothing here is
// allowed to throw at the caller: a failed email must not roll back a recorded verdict or trigger
// a re-run of the whole pipeline. Failures are logged and dropped.
//
// Two channels: an in-app row via the existing notifications module, and an email via the existing
// SendGrid `EmailService`. Neither is reimplemented.
const EmailService = require("../../../common/emails/email.service");
const { DECISIONS } = require("./decision.engine");

// `notification.model.js` requires `src/config` at module scope, and that module calls
// process.exit(1) when it cannot reach Postgres. Requiring it lazily keeps this file importable
// without a live database — the worker resolves it on first use, tests inject a stub.
function defaultNotificationModel() {
  return require("../../notifications/model/notification.model");
}

/**
 * What the artist is told for each outcome.
 *
 * A flagged submission is described as "in review", not "flagged": from the artist's side the
 * distinction between a borderline authenticity score and a queue backlog is noise, and telling
 * them which rule they nearly tripped is an invitation to tune a submission against the detector.
 */
const MESSAGES = {
  [DECISIONS.AUTO_APPROVED]: {
    type: "artwork.approved",
    title: "Your artwork was approved",
    body: (artwork) => `"${artwork.title}" passed review and is now live.`,
    emailSubject: "Your artwork was approved",
    emailContent: (artwork) => `
      <p>Good news — <strong>${escapeHtml(artwork.title)}</strong> passed our checks and is now
      published.</p>
    `,
    color: "#16a34a",
  },
  [DECISIONS.AUTO_REJECTED]: {
    type: "artwork.rejected",
    title: "Your artwork was not accepted",
    body: (artwork) => `"${artwork.title}" did not pass our content checks.`,
    emailSubject: "Your artwork was not accepted",
    emailContent: (artwork) => `
      <p><strong>${escapeHtml(artwork.title)}</strong> did not pass our content checks and has not
      been published.</p>
      <p>If you believe this is a mistake, reply to this email and a human will take a look.</p>
    `,
    color: "#dc2626",
  },
  [DECISIONS.FLAGGED_MANUAL]: {
    type: "artwork.in_review",
    title: "Your artwork is being reviewed",
    body: (artwork) => `"${artwork.title}" is waiting on a human reviewer.`,
    emailSubject: "Your artwork is being reviewed",
    emailContent: (artwork) => `
      <p><strong>${escapeHtml(artwork.title)}</strong> needs a quick look from one of our reviewers
      before it goes live.</p>
      <p>No action is needed from you — we will email you when it is done.</p>
    `,
    color: "#f59e0b",
  },
};

/** Artist-supplied titles end up inside an HTML email, so they are escaped, not interpolated raw. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Notifies the artwork's creator of a screening decision.
 *
 * @param {import('kysely').Kysely<any>} db
 * @param {{run: object, decision: string, config: object}} event
 * @param {{notificationModel?: object, emailService?: object}} [deps]
 */
async function notifyDecision(db, { run, decision, config }, deps = {}) {
  const emails = deps.emailService ?? EmailService;

  const message = MESSAGES[decision];

  if (!message) {
    console.error(`[screening] no notification defined for decision: ${decision}`);
    return { notified: false, reason: "unknown_decision" };
  }

  // The brand's own setting. A brand running a private review process may not want the platform
  // emailing its entrants at all.
  if (config?.notifyArtist === false) {
    return { notified: false, reason: "disabled_by_ruleset" };
  }

  const artwork = await db
    .selectFrom("artworks")
    .innerJoin("users", "users.id", "artworks.creator_id")
    .select([
      "artworks.id as id",
      "artworks.title as title",
      "users.id as user_id",
      "users.email as email",
      "users.username as username",
    ])
    .where("artworks.id", "=", run.artwork_id)
    .executeTakeFirst();

  if (!artwork?.user_id) {
    return { notified: false, reason: "no_creator" };
  }

  const result = { notified: false, inApp: false, email: false };
  const notifications = deps.notificationModel ?? defaultNotificationModel();

  // The two channels are attempted independently: a SendGrid outage should still leave the artist
  // with an in-app notification.
  try {
    await notifications.create({
      user_id: artwork.user_id,
      type: message.type,
      title: message.title,
      body: message.body(artwork),
      data: {
        artwork_id: artwork.id,
        screening_run_id: run.id,
        decision,
      },
    });
    result.inApp = true;
  } catch (error) {
    console.error(
      `[screening] in-app notification failed for artwork ${artwork.id}: ${error.message}`
    );
  }

  try {
    if (artwork.email) {
      const html = emails.generateTemplate({
        title: message.title,
        content: message.emailContent(artwork),
        buttonText: "View your artwork",
        buttonUrl: `${process.env.FRONTEND_URL ?? ""}/artwork/${artwork.id}`,
        color: message.color,
      });

      await emails.sendEmail({
        to: artwork.email,
        subject: message.emailSubject,
        html,
      });
      result.email = true;
    }
  } catch (error) {
    console.error(
      `[screening] decision email failed for artwork ${artwork.id}: ${error.message}`
    );
  }

  result.notified = result.inApp || result.email;

  return result;
}

module.exports = { MESSAGES, escapeHtml, notifyDecision };
