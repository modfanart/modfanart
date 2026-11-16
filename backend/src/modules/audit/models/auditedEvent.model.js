// src/modules/audit/models/auditedEvent.model.js
const { sql } = require('kysely');
const { db } = require('../../../config');
const { record } = require('../audit.service');

function baseQuery() {
  return db
    .selectFrom('audited_events as e')
    .leftJoin('users as u', 'u.id', 'e.actor_id')
    .leftJoin('roles as r', 'r.id', 'u.role_id');
}

function applyFilters(q, f) {
  if (f.actorId) q = q.where('e.actor_id', '=', f.actorId);
  if (f.entityType) q = q.where('e.entity_type', '=', f.entityType);
  if (f.entityId) q = q.where('e.entity_id', '=', f.entityId);
  if (f.source) q = q.where('e.source', '=', f.source);
  if (f.action) q = q.where('e.action', 'ilike', `${f.action.replace(/[%_]/g, '\\$&')}%`);
  if (f.from) q = q.where('e.created_at', '>=', f.from);
  if (f.to) q = q.where('e.created_at', '<=', f.to);
  if (f.outcome === 'failed') q = q.where('e.status_code', '>=', 400);
  if (f.outcome === 'ok') q = q.where((eb) => eb.or([eb('e.status_code', '<', 400), eb('e.status_code', 'is', null)]));
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, '\\$&')}%`;
    q = q.where((eb) =>
      eb.or([
        eb('e.action', 'ilike', like),
        eb('e.summary', 'ilike', like),
        eb('e.entity_id', 'ilike', like),
        eb('u.username', 'ilike', like),
        eb('u.email', 'ilike', like),
      ])
    );
  }
  return q;
}

const COLUMNS = [
  'e.id',
  'e.action',
  'e.entity_type',
  'e.entity_id',
  'e.summary',
  'e.source',
  'e.status_code',
  'e.ip_address',
  'e.user_agent',
  'e.created_at',
  'e.actor_id',
  'u.username as actor_username',
  'u.email as actor_email',
  'u.avatar_url as actor_avatar_url',
  'r.name as actor_role',
];

class AuditedEvent {
  /** Kept for existing callers. Prefer audit.service.record(). */
  static log(actorId, action, entityType = null, entityId = null, oldValues = null, newValues = null, ip = null, userAgent = null) {
    return record({
      actorId,
      action,
      entityType,
      entityId,
      before: typeof oldValues === 'string' ? safeParse(oldValues) : oldValues,
      after: typeof newValues === 'string' ? safeParse(newValues) : newValues,
      req: { ip, headers: { 'user-agent': userAgent } },
    });
  }

  static async search(filters = {}) {
    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = Math.max(Number(filters.offset) || 0, 0);

    const rows = await applyFilters(baseQuery(), filters)
      .select(COLUMNS)
      .orderBy('e.created_at', 'desc')
      .orderBy('e.id', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    const { total } = await applyFilters(baseQuery(), filters)
      .select(sql`count(*)::int`.as('total'))
      .executeTakeFirst();

    return { data: rows, total, limit, offset };
  }

  static async findById(id) {
    return baseQuery()
      .select([...COLUMNS, 'e.old_values', 'e.new_values'])
      .where('e.id', '=', id)
      .executeTakeFirst();
  }

  /** Values for the workspace filter dropdowns. */
  static async facets() {
    const since = sql`now() - interval '90 days'`;
    const [entityTypes, actions, actors] = await Promise.all([
      db.selectFrom('audited_events').select('entity_type').distinct()
        .where('entity_type', 'is not', null).orderBy('entity_type').execute(),
      db.selectFrom('audited_events')
        .select(['action', sql`count(*)::int`.as('count')])
        .where('created_at', '>=', since)
        .groupBy('action').orderBy('count', 'desc').limit(50).execute(),
      db.selectFrom('audited_events as e').innerJoin('users as u', 'u.id', 'e.actor_id')
        .select(['u.id', 'u.username', 'u.email', sql`count(*)::int`.as('count')])
        .where('e.created_at', '>=', since)
        .groupBy(['u.id', 'u.username', 'u.email']).orderBy('count', 'desc').limit(50).execute(),
    ]);
    return {
      entity_types: entityTypes.map((r) => r.entity_type),
      actions,
      actors,
    };
  }

  /** Daily counts for the activity chart. */
  static async daily(filters = {}, days = 30) {
    return applyFilters(
      db.selectFrom('audited_events as e').leftJoin('users as u', 'u.id', 'e.actor_id'),
      { ...filters, from: filters.from || new Date(Date.now() - days * 86400000) }
    )
      .select([sql`date_trunc('day', e.created_at)::date`.as('day'), sql`count(*)::int`.as('count')])
      .groupBy(sql`date_trunc('day', e.created_at)`)
      .orderBy('day')
      .execute();
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

module.exports = AuditedEvent;
