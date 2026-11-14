// src/common/middleware/audit-trail.js
//
// Request-level activity log. Records:
//   - every successful state change on a sensitive route,
//   - every state change made by staff (admin tier or workspace.access),
//   - denied (401/403) attempts on sensitive routes (security signal).
// Domain code adds richer entries (before/after) through audit.service.record.
// Registered once in index.js before the routers; reads req.user at response
// time and never blocks the request.

const { isStaffUser } = require('./require-admin');

// [pattern, entity type]
const SENSITIVE = [
  [/^\/api\/admin\/users\b/, 'user'],
  [/^\/api\/admin\/brands\b/, 'brand'],
  [/^\/api\/admin\b/, 'admin'],
  [/^\/api\/roles\b/, 'role'],
  [/^\/api\/users\/create\b/, 'user'],
  [/^\/api\/users\/(?!me\b)[^/]+/, 'user'],
  [/^\/api\/brands\/verification-requests\b/, 'brand_verification'],
  [/^\/api\/brands\/?$/, 'brand'],
  [/^\/api\/licenses\/[^/]+\/revoke\b/, 'license'],
  [/^\/api\/payout\b/, 'payout'],
  [/^\/api\/marketplace-admin\/products\b/, 'merch_product'],
  [/^\/api\/marketplace-admin\/sellers\b/, 'seller'],
  [/^\/api\/marketplace-admin\/fee-rules\b/, 'fee_rule'],
  [/^\/api\/marketplace-admin\/print-providers\b/, 'print_provider'],
  [/^\/api\/marketplace-admin\/orders\b/, 'order'],
  [/^\/api\/marketplace-admin\/reviews\b/, 'review'],
  [/^\/api\/marketplace-admin\/prizes\b/, 'contest_prize'],
  [/^\/api\/marketplace-admin\b/, 'marketplace'],
  [/^\/api\/seller-profiles\b/, 'seller'],
  [/^\/api\/merch\/[^/]+\/(moderate|status)\b/, 'merch_product'],
  [/^\/api\/contest\/[^/]+\/(winners|announce-winners|distribute-prizes|prizes)\b/, 'contest'],
  [/^\/api\/contest\/prizes\b/, 'contest_prize'],
  [/^\/api\/orders\/[^/]+\/cancel\b/, 'order'],
  [/^\/api\/contact\/[^/]+/, 'contact_message'],
];

// Entity type guess for staff actions on non-sensitive routes.
const PREFIX_ENTITY = {
  contest: 'contest', artwork: 'artwork', brands: 'brand', users: 'user', merch: 'merch_product',
  orders: 'order', order: 'order', licenses: 'license', collections: 'collection', category: 'category',
  tags: 'tag', projects: 'project', tasks: 'task', media: 'media', notifications: 'notification',
};

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const VERB = { POST: 'created', PUT: 'replaced', PATCH: 'updated', DELETE: 'deleted' };

function auditTrail(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();

  const path = req.originalUrl.split('?')[0];
  // Webhooks are logged by their own handlers; auth is too noisy (and has passwords).
  if (/^\/api\/(auth|payout\/stripe|webhooks?)\b/.test(path)) return next();

  const body = req.body;

  res.on('finish', () => {
    const match = SENSITIVE.find(([re]) => re.test(path));
    const status = res.statusCode;
    const ok = status < 400;
    const staff = isStaffUser(req.user);

    if (ok && !match && !staff) return;
    if (!ok && !(match && (status === 401 || status === 403))) return;

    const segs = path.split('/').filter(Boolean); // ['api', entity, id, ...]
    const entityType = match?.[1] ?? PREFIX_ENTITY[segs[1]] ?? segs[1] ?? null;
    const entityId = path.match(UUID_RE)?.[0] ?? null;
    const verb = ok ? VERB[req.method] || req.method.toLowerCase() : 'denied';
    // Sub-action = path after the id: /products/<id>/status -> "status".
    const idIdx = segs.findIndex((s) => UUID_RE.test(s));
    const tail = idIdx >= 0 ? segs.slice(idIdx + 1).filter((s) => !UUID_RE.test(s)).join('.') : '';

    // Lazy require keeps this loadable without a DB in unit tests.
    let record;
    try {
      ({ record } = require('../../modules/audit/audit.service'));
    } catch {
      return;
    }
    record({
      req,
      action: `${entityType || 'request'}.${tail ? `${tail}.` : ''}${verb}`.replace(/-/g, '_'),
      entityType,
      entityId,
      after: body && typeof body === 'object' && !Buffer.isBuffer(body) ? body : null,
      summary: `${req.method} ${path}${ok ? '' : ` (HTTP ${status})`}`,
      statusCode: status,
    });
  });

  next();
}

module.exports = { auditTrail };
