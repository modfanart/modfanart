import { MDConnection } from '@motherduck/wasm-client';
import { config } from '../config';
import { logger } from '../logger';

let client: MDConnection | null = null;

/**
 * Get / create a MotherDuck connection
 */
export function getMotherDuckConnection() {
  if (!client) {
    logger.info('Creating new MotherDuck connection', { context: 'motherduck' });

    client = MDConnection.create({
      mdToken: config.duckDb.mdToken,
    });
  }
  return client;
}

/**
 * Execute a query
 */
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const conn = getMotherDuckConnection();
  await conn.isInitialized();

  try {
    const result = await conn.evaluateQuery(query);

    // Ensure we have materialized data
    if (result.type === 'materialized' && result.data) {
      return result.data.toRows() as T[];
    }

    // Fallback: no rows
    return [];
  } catch (error) {
    logger.error('Error executing MotherDuck query', error, {
      context: 'motherduck',
      data: { query },
    });
    throw error;
  }
}

/**
 * Create analytics tables if they don't exist
 */
export async function initializeAnalyticsTables(): Promise<void> {
  try {
    // Create submissions_analytics table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS submissions_analytics (
        id VARCHAR PRIMARY KEY,
        title VARCHAR,
        category VARCHAR,
        original_ip VARCHAR,
        created_at TIMESTAMP,
        status VARCHAR,
        ai_score DOUBLE,
        ip_compliance_score INTEGER,
        content_safety_score INTEGER,
        overall_risk_score INTEGER
      )
    `);

    // Create user_activity table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR,
        action_type VARCHAR,
        resource_type VARCHAR,
        resource_id VARCHAR,
        created_at TIMESTAMP,
        metadata JSON
      )
    `);

    logger.info('Analytics tables initialized successfully', { context: 'motherduck' });
  } catch (error) {
    logger.error('Failed to initialize analytics tables', error, { context: 'motherduck' });
    throw error;
  }
}

/**
 * Track a submission in analytics
 */
export async function trackSubmission(submission: {
  id: string;
  title: string;
  category: string;
  originalIp: string;
  createdAt: Date;
  status: string;
  aiScore: number;
  ipComplianceScore: number;
  contentSafetyScore: number;
  overallRiskScore: number;
}): Promise<void> {
  try {
    await executeQuery(
      `
      INSERT INTO submissions_analytics (
        id, title, category, original_ip, created_at, status,
        ai_score, ip_compliance_score, content_safety_score, overall_risk_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        submission.id,
        submission.title,
        submission.category,
        submission.originalIp,
        submission.createdAt.toISOString(),
        submission.status,
        submission.aiScore,
        submission.ipComplianceScore,
        submission.contentSafetyScore,
        submission.overallRiskScore,
      ]
    );

    logger.info('Tracked submission in analytics', {
      context: 'motherduck',
      submissionId: submission.id,
    });
  } catch (error) {
    logger.error('Failed to track submission in analytics', error, {
      context: 'motherduck',
      data: { submissionId: submission.id },
    });

    // Don't throw - analytics failures shouldn't break the main flow
  }
}

/**
 * Track user activity
 */
export async function trackUserActivity(activity: {
  userId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const createdAt = new Date();

    await executeQuery(
      `
      INSERT INTO user_activity (
        id, user_id, action_type, resource_type, resource_id, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        activity.userId,
        activity.actionType,
        activity.resourceType,
        activity.resourceId,
        createdAt.toISOString(),
        JSON.stringify(activity.metadata || {}),
      ]
    );

    logger.debug('Tracked user activity', {
      context: 'motherduck',
      userId: activity.userId,
      actionType: activity.actionType,
    });
  } catch (error) {
    logger.error('Failed to track user activity', error, {
      context: 'motherduck',
      data: { userId: activity.userId },
    });

    // Don't throw - analytics failures shouldn't break the main flow
  }
}

/**
 * Get submission analytics
 */
export async function getSubmissionAnalytics(
  filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    status?: string;
  } = {}
): Promise<any[]> {
  let query = `
    SELECT 
      DATE_TRUNC('day', created_at) AS date,
      category,
      status,
      COUNT(*) AS count,
      AVG(ai_score) AS avg_ai_score,
      AVG(overall_risk_score) AS avg_risk_score
    FROM submissions_analytics
    WHERE 1=1
  `;

  const params: any[] = [];

  if (filters.startDate) {
    query += ` AND created_at >= ?`;
    params.push(filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query += ` AND created_at <= ?`;
    params.push(filters.endDate.toISOString());
  }

  if (filters.category) {
    query += ` AND category = ?`;
    params.push(filters.category);
  }

  if (filters.status) {
    query += ` AND status = ?`;
    params.push(filters.status);
  }

  query += `
    GROUP BY DATE_TRUNC('day', created_at), category, status
    ORDER BY date DESC, category, status
  `;

  return executeQuery(query, params);
}

/**
 * Close the MotherDuck client connection
 */
export function closeConnection(): Promise<void> {
  if (client) {
    logger.info('Closing MotherDuck client connection', { context: 'motherduck' });
    const closePromise = client.close();
    client = null;
    return closePromise;
  }
  return Promise.resolve();
}
