// src/modules/audit/controller/audit.controller.js
//
// Read-only API for the workspace Activity Logs page. There is deliberately
// no public "create" endpoint any more: a client could forge entries.
const AuditedEvent = require('../models/auditedEvent.model');
const { UUID_RE } = require('../audit.service');

function filtersFrom(query) {
  const date = (v) => {
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  return {
    q: query.q?.trim() || undefined,
    actorId: query.actorId && UUID_RE.test(query.actorId) ? query.actorId : undefined,
    entityType: query.entityType || undefined,
    entityId: query.entityId || undefined,
    action: query.action || undefined,
    source: query.source || undefined,
    outcome: ['ok', 'failed'].includes(query.outcome) ? query.outcome : undefined,
    from: date(query.from),
    to: date(query.to),
    limit: query.limit,
    offset: query.offset,
  };
}

async function search(req, res, next) {
  try {
    res.json(await AuditedEvent.search(filtersFrom(req.query)));
  } catch (err) {
    next(err);
  }
}

async function facets(req, res, next) {
  try {
    res.json(await AuditedEvent.facets());
  } catch (err) {
    next(err);
  }
}

async function daily(req, res, next) {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    res.json({ data: await AuditedEvent.daily(filtersFrom(req.query), days) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    if (!UUID_RE.test(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const event = await AuditedEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json({ data: event });
  } catch (err) {
    next(err);
  }
}

// CSV export (max 10,000 rows) of whatever the filters select.
async function exportCsv(req, res, next) {
  try {
    const { data } = await AuditedEvent.search({ ...filtersFrom(req.query), limit: 200, offset: 0 });
    let rows = data;
    // page through for larger exports
    for (let offset = 200; rows.length === offset && offset < 10000; offset += 200) {
      const page = await AuditedEvent.search({ ...filtersFrom(req.query), limit: 200, offset });
      rows = rows.concat(page.data);
      if (page.data.length < 200) break;
    }
    const cols = ['created_at', 'actor_username', 'actor_email', 'actor_role', 'action', 'summary', 'entity_type', 'entity_id', 'status_code', 'source', 'ip_address'];
    const esc = (v) => {
      if (v == null) return '';
      const s = v instanceof Date ? v.toISOString() : String(v);
      // Guard against CSV formula injection in spreadsheet apps.
      const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="activity-log-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { search, facets, daily, getById, exportCsv };
