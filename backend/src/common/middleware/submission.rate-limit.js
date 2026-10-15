// Per-artist submission limit.
//
// Every accepted submission costs three external API calls, two of them billed. The global limiter
// in index.js is keyed by IP, which does nothing about one authenticated account submitting in a
// loop and everything wrong about a shared campus or office NAT. This one is keyed by user id.
//
// Deliberately generous: it exists to bound the cost of an automated flood, not to shape the
// behaviour of a prolific artist.
const rateLimit = require("express-rate-limit");

const WINDOW_MS = Number(process.env.SUBMISSION_RATE_WINDOW_MS ?? 60 * 60 * 1000);
const LIMIT = Number(process.env.SUBMISSION_RATE_LIMIT ?? 60);

const submissionRateLimit = rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  // Falls back to IP for the unauthenticated case. That should not happen — every route using this
  // sits behind authenticateToken — but a limiter that silently stops limiting is worse than one
  // that degrades to the weaker key.
  keyGenerator: (req) => req.user?.id ?? req.ip,
  message: {
    error: "Submission limit reached",
    message: "You have submitted too many artworks in a short period. Please try again later.",
  },
});

module.exports = { LIMIT, WINDOW_MS, submissionRateLimit };
