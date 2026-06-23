// backend/src/models/audit.js
const { db } = require('../config');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Zod schemas — copy from frontend/validation/model-validation.js or define here
const z = require('zod');

const AuditActionEnum = z.enum([
  'create', 'update', 'delete', 'view', 'approve', 'reject',
  'license', 'revoke', 'payment', 'login', 'logout', 'settings_change'
]);

const EntityTypeEnum = z.enum(['user', 'submission', 'product', 'license', 'payment', 'system']);

const CreateAuditLogSchema = z.object({
  userId: z.string().uuid().optional(),
  action: AuditActionEnum,
  entityType: EntityTypeEnum,
  entityId: z.string().uuid().optional(),
  details: z.record(z.any()).default({}),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
});

// ─────────────────────────────────────────────
//              Helpers
// ─────────────────────────────────────────────

function mapRowToAuditLog(row) {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details ?? {},
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

// ─────────────────────────────────────────────
//              Core Operations
// ─────────────────────────────────────────────

async function createAuditLog(logData) {
  try {
    const validated = CreateAuditLogSchema.parse(logData);
    const id = uuidv4();
    const now = new Date();

    const auditLog = {
      id,
      ...validated,
      createdAt: now,
    };

    await db
      .insertInto('audit_logs')
      .values({
        id: auditLog.id,
        user_id: auditLog.userId ?? null,
        action: auditLog.action,
        entity_type: auditLog.entityType,
        entity_id: auditLog.entityId ?? null,
        details: auditLog.details, // object → JSONB
        ip_address: auditLog.ipAddress ?? null,
        user_agent: auditLog.userAgent ?? null,
        created_at: auditLog.createdAt,
      })
      .execute();

    logger.debug('Audit log created', { logId: id });
    return auditLog;
  } catch (error) {
    logger.error('Failed to create audit log', {
      error: error.message || error,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid audit log data: ${JSON.stringify(error.issues)}`);
    }

    throw error;
  }
}

async function getAuditLogById(id) {
  try {
    const row = await db
      .selectFrom('audit_logs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? mapRowToAuditLog(row) : null;
  } catch (error) {
    logger.error('Failed to get audit log by id', { error: error.message || error, id });
    throw new Error(`Failed to retrieve audit log: ${error.message}`);
  }
}

async function getAuditLogsByUserId(userId, limit = 100) {
  try {
    const results = await db
      .selectFrom('audit_logs')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();

    return results.map(mapRowToAuditLog);
  } catch (error) {
    logger.error('Failed to get audit logs by user id', { error: error.message || error, userId });
    throw new Error(`Failed to retrieve audit logs for user: ${error.message}`);
  }
}

async function searchAuditLogs(params = {}) {
  try {
    let query = db
      .selectFrom('audit_logs')
      .selectAll();

    if (params.action) query = query.where('action', '=', params.action);
    if (params.entityType) query = query.where('entity_type', '=', params.entityType);
    if (params.entityId) query = query.where('entity_id', '=', params.entityId);
    if (params.userId) query = query.where('user_id', '=', params.userId);
    if (params.startDate) query = query.where('created_at', '>=', params.startDate);
    if (params.endDate) query = query.where('created_at', '<=', params.endDate);

    const countQuery = query.clearSelect().select(db.fn.count('id').as('total'));
    const dataQuery = query
      .orderBy('created_at', 'desc')
      .limit(params.limit ?? 50)
      .offset(params.offset ?? 0);

    const [countResult, logs] = await Promise.all([
      countQuery.executeTakeFirst(),
      dataQuery.execute(),
    ]);

    const total = Number(countResult?.total ?? 0);

    return {
      logs: logs.map(mapRowToAuditLog),
      total,
    };
  } catch (error) {
    logger.error('Failed to search audit logs', { error: error.message || error });
    throw new Error(`Failed to search audit logs: ${error.message}`);
  }
}

// ─────────────────────────────────────────────
//              Convenience Helpers
// ─────────────────────────────────────────────

const audit = {
  system: async (action, details = {}) => {
    return createAuditLog({
      action,
      entityType: 'system',
      details,
    });
  },

  user: async (userId, action, details = {}) => {
    return createAuditLog({
      userId,
      action,
      entityType: 'user',
      entityId: userId,
      details,
    });
  },

  entity: async (userId, entityType, entityId, action, details = {}) => {
    return createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      details,
    });
  },
};

module.exports = {
  createAuditLog,
  getAuditLogById,
  getAuditLogsByUserId,
  searchAuditLogs,
  audit,
};