import { db, DB } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { z } from 'zod';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'approve'
  | 'reject'
  | 'license'
  | 'revoke'
  | 'payment'
  | 'login'
  | 'logout'
  | 'settings_change';

export type EntityType = 'user' | 'submission' | 'product' | 'license' | 'payment' | 'system';

const CreateAuditLogSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.enum([
    'create',
    'update',
    'delete',
    'view',
    'approve',
    'reject',
    'license',
    'revoke',
    'payment',
    'login',
    'logout',
    'settings_change',
  ]),
  entityType: z.enum(['user', 'submission', 'product', 'license', 'payment', 'system']),
  entityId: z.string().uuid().optional(),
  details: z.record(z.string(), z.any()).default({}), // Correct
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
});

export interface AuditLog {
  id: string;
  userId?: string | undefined; // ← Explicitly allow undefined
  action: AuditAction;
  entityType: EntityType;
  entityId?: string | undefined;
  details: Record<string, any>;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  createdAt: Date;
}

/**
 * CREATE AUDIT LOG
 */
export async function createAuditLog(
  logData: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  try {
    const validatedData = CreateAuditLogSchema.parse(logData);
    const id = uuidv4();
    const now = new Date();

    const auditLog: AuditLog = {
      id,
      ...validatedData,
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
        details: auditLog.details, // ← Pass object directly — Kysely serializes JSON
        ip_address: auditLog.ipAddress ?? null,
        user_agent: auditLog.userAgent ?? null,
        created_at: auditLog.createdAt,
      })
      .execute();

    logger.debug('Audit log created', { logId: id });

    return auditLog;
  } catch (error: any) {
    logger.error('Failed to create audit log', {
      error: error instanceof Error ? error : new Error(String(error)),
    });

    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')} : ${e.message}`).join('; ');
      throw new Error(`Invalid audit log data: ${messages}`);
    }

    throw error;
  }
}

/**
 * SEARCH AUDIT LOGS
 */
export async function searchAuditLogs(params: {
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLog[]; total: number }> {
  try {
    let baseQuery = db
      .selectFrom('audit_logs')
      .selectAll()
      .$if(!!params.action, (qb) => qb.where('action', '=', params.action!))
      .$if(!!params.entityType, (qb) => qb.where('entity_type', '=', params.entityType!))
      .$if(!!params.entityId, (qb) => qb.where('entity_id', '=', params.entityId!))
      .$if(!!params.userId, (qb) => qb.where('user_id', '=', params.userId!))
      .$if(!!params.startDate, (qb) => qb.where('created_at', '>=', params.startDate!))
      .$if(!!params.endDate, (qb) => qb.where('created_at', '<=', params.endDate!));

    const countQuery = baseQuery.clearSelect().select(db.fn.count<number>('id').as('total'));

    const dataQuery = baseQuery
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
  } catch (error: any) {
    logger.error('Failed to search audit logs', {
      error, // Pass the entire error object
    });
    throw new Error(`Failed to search audit logs: ${error.message}`);
  }
}

/**
 * GET AUDIT LOG BY ID
 */
export async function getAuditLogById(id: string): Promise<AuditLog | null> {
  try {
    const row = await db
      .selectFrom('audit_logs')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? mapRowToAuditLog(row) : null;
  } catch (error: any) {
    logger.error('Failed to get audit log by id', {
      error: error instanceof Error ? error : new Error(String(error)),
      id,
    });
    throw new Error(`Failed to retrieve audit log: ${error.message}`);
  }
}

/**
 * GET AUDIT LOGS BY USER ID
 */
export async function getAuditLogsByUserId(userId: string, limit = 100): Promise<AuditLog[]> {
  try {
    const results = await db
      .selectFrom('audit_logs')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();

    return results.map(mapRowToAuditLog);
  } catch (error: any) {
    logger.error('Failed to get audit logs by user id', {
      error: error instanceof Error ? error : new Error(String(error)),
      userId,
    });
    throw new Error(`Failed to retrieve audit logs for user: ${error.message}`);
  }
}

/**
 * MAPPER: DB row → AuditLog
 */
function mapRowToAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    action: row.action as AuditAction,
    entityType: row.entity_type as EntityType,
    entityId: row.entity_id ?? undefined,
    details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details ?? {},
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Convenience helpers for common audit scenarios
 */
export const audit = {
  system: (action: AuditAction, details: Record<string, any> = {}) =>
    createAuditLog({
      action,
      entityType: 'system',
      details,
    }),

  user: (userId: string, action: AuditAction, details: Record<string, any> = {}) =>
    createAuditLog({
      userId,
      action,
      entityType: 'user',
      entityId: userId,
      details,
    }),

  entity: (
    userId: string | undefined,
    entityType: EntityType,
    entityId: string,
    action: AuditAction,
    details: Record<string, any> = {}
  ) =>
    createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      details,
    }),
};
