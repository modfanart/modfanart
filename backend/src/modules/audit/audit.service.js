// src/modules/audit/audit.service.js
//
// One way to write to the activity log. Never throws: logging must not break
// the request it describes.

const { db } = require('../../config');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REDACT = /pass(word)?|token|secret|card|cvc|iban|account_number|authorization/i;

function redact(value, depth = 0) {
  if (value == null || depth > 4) return value ?? null;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = REDACT.test(k) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && value.length > 2000) return `${value.slice(0, 2000)}…`;
  return value;
}

function toJson(value) {
  if (value == null) return null;
  try {
    const json = JSON.stringify(redact(value));
    return json.length > 20000 ? JSON.stringify({ truncated: true }) : json;
  } catch {
    return null;
  }
}

/**
 * @param {object} e
 * @param {object} [e.req]           express request (actor, ip, user agent)
 * @param {string} [e.actorId]       overrides req.user.id
 * @param {string}  e.action         e.g. "role.permissions_updated"
 * @param {string} [e.entityType]    e.g. "role"
 * @param {string} [e.entityId]
 * @param {object} [e.before]
 * @param {object} [e.after]
 * @param {string} [e.summary]       human sentence shown in the workspace
 * @param {string} [e.source]        'api' | 'workspace' | 'system' | 'webhook'
 * @param {number} [e.statusCode]
 */
async function record(e) {
  try {
    const req = e.req;
    const actorId = e.actorId ?? req?.user?.id ?? null;
    await db
      .insertInto('audited_events')
      .values({
        actor_id: actorId && UUID_RE.test(actorId) ? actorId : null,
        action: String(e.action).slice(0, 200),
        entity_type: e.entityType ?? null,
        entity_id: e.entityId != null ? String(e.entityId).slice(0, 200) : null,
        old_values: toJson(e.before),
        new_values: toJson(e.after),
        ip_address: req?.ip ?? null,
        user_agent: req?.headers?.['user-agent']?.slice(0, 500) ?? null,
        source: e.source ?? (req?.headers?.['x-client'] === 'workspace' ? 'workspace' : 'api'),
        summary: e.summary ? String(e.summary).slice(0, 500) : null,
        status_code: e.statusCode ?? null,
      })
      .execute();
  } catch (err) {
    console.error('[audit] failed to record event:', err.message);
  }
}

module.exports = { record, redact, UUID_RE };
