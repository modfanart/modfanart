import debug from 'debug';

// Initialize namespaces
const appDebug = debug('mod:app');
const apiDebug = debug('mod:api');
const dbDebug = debug('mod:db');
const aiDebug = debug('mod:ai');
const authDebug = debug('mod:auth');

// Enable debug based on environment variable
if (process.env.DEBUG) {
  debug.enable(process.env.DEBUG);
} else {
  debug.disable();
}

type LogMeta = {
  context?: string;
  error?: Error;
  [key: string]: any; // Allow any additional fields (requestId, userId, etc.)
};

/**
 * Structured logger for the application
 */
export const logger = {
  info(message: string, meta?: LogMeta): void {
    console.log(`[INFO] ${message}`, meta ?? '');
    appDebug('[INFO] %s %O', message, meta ?? {});
  },

  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${message}`, meta ?? '');
    appDebug('[WARN] %s %O', message, meta ?? {});
  },

  error(message: string, meta?: LogMeta): void {
    const err = meta?.error;
    console.error(`[ERROR] ${message}`, err ?? '', meta ?? '');
    appDebug('[ERROR] %s %O %O', message, err ?? '', meta ?? {});
  },

  debug(message: string, meta?: LogMeta): void {
    appDebug('[DEBUG] %s %O', message, meta ?? {});
  },

  namespace(namespace: string): debug.Debugger {
    return debug(`mod:${namespace}`);
  },

  // Namespaced debuggers
  api: apiDebug,
  db: dbDebug,
  ai: aiDebug,
  auth: authDebug,
};

debug.formatters['t'] = () => new Date().toISOString();
