// src/common/middleware/audit-trail.js
//
// Staff accountability. The audited_events table and model existed but
// nothing ever wrote to it, so there was no record of who banned a user,
// verified a brand, changed a role, revoked a license or marked a payout
// paid. This middleware records every successful state-changing request on
// sensitive routes, and every state-changing request made by an admin-tier
// account anywhere.
//
// Registered once in index.js, before the routers. It reads req.user at
// response time (set by authenticateToken inside each router) and never
// blocks or fails the request.

const { isAdminUser } = require('./require-admin');

const SENSITIVE = [
  /^\/api\/admin\b/,
  /^\/api\/roles\b/,
  /^\/api\/users\/(?!me\b)[^/]+/, // admin edits of other users
  /^\/api\/users\/create\b/,
  /^\/api\/brands\/verification-requests\b/,
  /^\/api\/brands\/?$/, // brand creation
  /^\/api\/licenses\/[^/]+\/revoke\b/,
  /^\/api\/payout\b/,
  /^\/api\/marketplace-admin\b/,
  /^\/api\/seller-profiles\b/,
  /^\/api\/merch\/[^/]+\/(moderate|status)\b/,
  /^\/api\/contest\/[^/]+\/(winners|announce-winners|distribute-prizes)\b/,
  /^\/api\/orders\/[^/]+\/cancel\b/,
  /^\/api\/contact\/[^/]+/,
];

const REDACT = /pass(word)?|token|secret|card|cvc|iban|account_number/i;

function redact(body) {
  if (!body || typeof body !== 'object' || Buffer.isBuffer(body)) return null;
  const out = {};
  for (const [k, v] of Object.entries(body)) {
    out[k] = REDACT.test(k) ? '[redacted]' : v;
  }
  const json = JSON.stringify(out);
  return json.length > 4000 ? { truncated: true } : out;
}

function auditTrail(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  const path = req.originalUrl.split('?')[0];
  const body = redact(req.body);

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    const user = req.user;
    const sensitive = SENSITIVE.some((re) => re.test(path));
    if (!sensitive && !isAdminUser(user)) return;

    // Lazy require: keeps this module loadable without a DB in unit tests.
    let AuditedEvent;
    try {
      AuditedEvent = require('../../modules/audit/models/auditedEvent.model');
    } catch {
      return;
    }
    const segs = path.split('/').filter(Boolean); // api, <entity>, <id>, ...
    AuditedEvent.log(
      user?.id ?? null,
      `${req.method} ${path}`,
      segs[1] ?? null,
      segs[2] ?? null,
      null,
      body ? JSON.stringify(body) : null,
      req.ip,
      req.headers['user-agent'] ?? null
    ).catch((err) => console.error('[audit] failed to record event:', err.message));
  });

  next();
}

module.exports = { auditTrail };
