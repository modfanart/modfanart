import debug from "debug"

// Initialize namespaces
const appDebug = debug("mod:app")
const apiDebug = debug("mod:api")
const dbDebug = debug("mod:db")
const aiDebug = debug("mod:ai")
const authDebug = debug("mod:auth")

// Enable debug based on environment variable
if (process.env.DEBUG) {
  debug.enable(process.env.DEBUG)
} else {
  // Disable all debug logs by default
  debug.disable()
}

type LogLevel = "info" | "warn" | "error" | "debug"
type LogContext = {
  context?: string
  data?: Record<string, any>
}

/**
 * Structured logger for the application
 */
export const logger = {
  /**
   * Log informational message
   */
  info(message: string, contextOrData?: LogContext | Record<string, any>): void {
    const context = normalizeContext(contextOrData)
    console.log(`[INFO] ${message}`, context.data ? context.data : "")
    appDebug("[INFO] %s %o", message, context)
  },

  /**
   * Log warning message
   */
  warn(message: string, contextOrData?: LogContext | Record<string, any>): void {
    const context = normalizeContext(contextOrData)
    console.warn(`[WARN] ${message}`, context.data ? context.data : "")
    appDebug("[WARN] %s %o", message, context)
  },

  /**
   * Log error message
   */
  error(message: string, error?: Error, contextOrData?: LogContext | Record<string, any>): void {
    const context = normalizeContext(contextOrData)
    console.error(`[ERROR] ${message}`, error, context.data ? context.data : "")
    appDebug("[ERROR] %s %o %o", message, error, context)
  },

  /**
   * Log debug message (only shown when DEBUG is enabled)
   */
  debug(message: string, contextOrData?: LogContext | Record<string, any>): void {
    const context = normalizeContext(contextOrData)
    appDebug("[DEBUG] %s %o", message, context)
  },

  /**
   * Get a namespaced debug logger
   */
  namespace(namespace: string): debug.Debugger {
    return debug(`mod:${namespace}`)
  },

  // Specific namespaced loggers
  api: apiDebug,
  db: dbDebug,
  ai: aiDebug,
  auth: authDebug,
}

/**
 * Normalize context object
 */
function normalizeContext(contextOrData?: LogContext | Record<string, any>): LogContext {
  if (!contextOrData) {
    return { context: undefined, data: undefined }
  }

  if ("context" in contextOrData) {
    return contextOrData as LogContext
  }

  return { context: undefined, data: contextOrData as Record<string, any> }
}

/**
 * Format debug message with timestamp
 */
debug.formatters.t = () => {
  const now = new Date()
  return now.toISOString()
}

