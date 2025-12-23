import { config } from "./config"

// Log levels
type LogLevel = "debug" | "info" | "warn" | "error"

// Log entry structure
type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  error?: Error | unknown
  data?: Record<string, any>
}

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, data } = entry

  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}]`

  if (context) {
    formattedMessage += ` [${context}]`
  }

  formattedMessage += `: ${message}`

  if (data && Object.keys(data).length > 0) {
    formattedMessage += ` ${JSON.stringify(data)}`
  }

  return formattedMessage
}

/**
 * Format an error for logging
 */
function formatError(error: Error | unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return { error }
}

/**
 * Logger implementation
 */
export const logger = {
  debug(message: string, data?: Record<string, any> | null, options?: { context?: string }): void {
    if (!config.debug.enabled || config.debug.level !== "debug") return

    const entry: LogEntry = {
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data,
    }

    console.debug(formatLogEntry(entry))
  },

  info(message: string, data?: Record<string, any> | null, options?: { context?: string }): void {
    if (!config.debug.enabled && config.isProduction) return

    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data,
    }

    console.info(formatLogEntry(entry))
  },

  warn(message: string, data?: Record<string, any> | null, options?: { context?: string }): void {
    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      data,
    }

    console.warn(formatLogEntry(entry))
  },

  error(message: string, error?: Error | unknown, options?: { context?: string; data?: Record<string, any> }): void {
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context: options?.context,
      error,
      data: options?.data,
    }

    console.error(formatLogEntry(entry))

    if (error) {
      console.error(formatError(error))
    }
  },
}

