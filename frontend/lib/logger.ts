// src/lib/logger.ts

import { config } from './config';

// Log levels with numeric priority (lower = more verbose)
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Helper to get current log level priority
function getCurrentLogLevelPriority(): number {
  const level = config.debug?.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return LOG_LEVEL_PRIORITY[level as LogLevel] ?? LOG_LEVEL_PRIORITY.info;
}

// Determine if a log level should be emitted
function shouldLog(level: LogLevel): boolean {
  if (level === 'warn' || level === 'error') return true;

  const isDev = process.env.NODE_ENV !== 'production';
  const debugEnabled = config.debug?.enabled ?? isDev;

  if (!debugEnabled) return false;

  const currentPriority = getCurrentLogLevelPriority();
  const thisPriority = LOG_LEVEL_PRIORITY[level];

  return thisPriority >= currentPriority;
}

// Log entry structure — all optional fields explicitly allow undefined
type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string | undefined;
  data?: Record<string, any> | undefined;
  error?: Error | unknown;
};

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, data } = entry;

  let formatted = `[${timestamp}] [${level.toUpperCase()}]`;

  if (context !== undefined && context !== null && context !== '') {
    formatted += ` [${context}]`;
  }

  formatted += ` ${message}`;

  if (data && Object.keys(data).length > 0) {
    formatted += `\n${JSON.stringify(data, null, 2)}`;
  }

  return formatted;
}

/**
 * Format an error object nicely
 */
function formatError(error: Error | unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || 'No stack trace'}`;
  }
  return JSON.stringify(error, null, 2);
}

/**
 * Centralized logger
 */
export const logger = {
  debug(message: string, data?: Record<string, any>, options?: { context?: string }): void {
    if (!shouldLog('debug')) return;

    const entry: LogEntry = {
      level: 'debug',
      message,
      timestamp: new Date().toISOString(),
      context: options?.context, // explicitly passed, can be undefined
      data,
    };

    console.debug(formatLogEntry(entry));
  },

  info(message: string, data?: Record<string, any>, options?: { context?: string }): void {
    if (!shouldLog('info')) return;

    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data,
    };

    console.info(formatLogEntry(entry));
  },

  warn(message: string, data?: Record<string, any>, options?: { context?: string }): void {
    if (!shouldLog('warn')) return;

    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data,
    };

    console.warn(formatLogEntry(entry));
  },

  error(
    message: string,
    error?: Error | unknown,
    options?: { context?: string; data?: Record<string, any> }
  ): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data: options?.data,
      error,
    };

    console.error(formatLogEntry(entry));

    if (error) {
      console.error(formatError(error));
    }
  },
};
