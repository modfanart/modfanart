import { postgresClient, DB } from '../config';
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
  details: z.record(z.any()).default({}),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
});

export interface AuditLog {
  id: string;
  userId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export async function createAuditLog(
  logData: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  try {
    // Validate input data (now with stricter enums)
    const validatedData = CreateAuditLogSchema.parse(logData);

    const id = uuidv4();
    const now = new Date();

    const auditLog: AuditLog = {
      id,
      ...validatedData,
      createdAt: now,
    };

    // Safe tagged template literal insert (assuming postgres.js library where sql`` handles params)
    await postgresClient.sql`
      INSERT INTO ${DB.AUDIT_LOGS} (
        id, user_id, action, entity_type, entity_id, 
        details, ip_address, user_agent, created_at
      ) VALUES (
        ${auditLog.id},
        ${auditLog.userId ?? null},
        ${auditLog.action},
        ${auditLog.entityType},
        ${auditLog.entityId ?? null},
        ${auditLog.details},  -- postgres.js safely serializes objects to JSON/JSONB
        ${auditLog.ipAddress ?? null},
        ${auditLog.userAgent ?? null},
        ${auditLog.createdAt}
      )
    `;

    logger.debug('Audit log created', {
      context: 'audit-log-model',
      data: {
        logId: id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
      },
    });

    return auditLog;
  } catch (error) {
    logger.error('Failed to create audit log', {
      context: 'audit-log-model',
      error,
      data: { action: logData.action, entityType: logData.entityType },
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Invalid audit log data: ${JSON.stringify(error)}`);
    }

    throw new Error(`Failed to create audit log: ${(error as Error).message}`);
  }
}

export async function getAuditLogsByEntityId(entityId: string): Promise<AuditLog[]> {
  if (!entityId || typeof entityId !== 'string') {
    throw new Error('Invalid entity ID');
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.AUDIT_LOGS} 
      WHERE entity_id = ${entityId} 
      ORDER BY created_at DESC
    `;

    return result.rows.map(mapRowToAuditLog);
  } catch (error) {
    logger.error('Failed to get audit logs by entity ID', {
      context: 'audit-log-model',
      error,
      data: { entityId },
    });
    throw new Error(`Failed to get audit logs: ${(error as Error).message}`);
  }
}

export async function getAuditLogsByUserId(userId: string): Promise<AuditLog[]> {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }

  try {
    const result = await postgresClient.sql`
      SELECT * FROM ${DB.AUDIT_LOGS} 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return result.rows.map(mapRowToAuditLog);
  } catch (error) {
    logger.error('Failed to get audit logs by user ID', {
      context: 'audit-log-model',
      error,
      data: { userId },
    });
    throw new Error(`Failed to get audit logs: ${(error as Error).message}`);
  }
}

export async function searchAuditLogs(params: {
  action?: AuditAction;
  entityType?: EntityType;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLog[]; total: number }> {
  try {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.action) {
      conditions.push(`action = $${paramIndex++}`);
      values.push(params.action);
    }

    if (params.entityType) {
      conditions.push(`entity_type = $${paramIndex++}`);
      values.push(params.entityType);
    }

    if (params.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(params.userId);
    }

    if (params.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(params.startDate);
    }

    if (params.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      values.push(params.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await postgresClient.sql`
      SELECT COUNT(*)::integer AS total 
      FROM ${DB.AUDIT_LOGS} 
      ${postgresClient.sql.unsafe(whereClause)}
    `.execute();

    const total = countResult.rows[0]?.total ?? 0;

    // Paginated query
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const result = await postgresClient.sql`
      SELECT * 
      FROM ${DB.AUDIT_LOGS} 
      ${postgresClient.sql.unsafe(whereClause)} 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      logs: result.rows.map(mapRowToAuditLog),
      total,
    };
  } catch (error) {
    logger.error('Failed to search audit logs', {
      context: 'audit-log-model',
      error,
      data: params,
    });
    throw new Error(`Failed to search audit logs: ${(error as Error).message}`);
  }
}

function mapRowToAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    details: row.details ?? {},
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: new Date(row.created_at),
  };
}
