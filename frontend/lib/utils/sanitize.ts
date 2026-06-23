import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"
import { logger } from "@/lib/logger"

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  })
}

/**
 * Create a sanitized Zod schema for text that might contain HTML
 */
export function createSanitizedStringSchema(options: {
  min?: number
  max?: number
  allowHtml?: boolean
  errorMessage?: string
}) {
  const { min, max, allowHtml = false, errorMessage } = options

  let schema = z.string()

  if (min !== undefined) {
    schema = schema.min(min, errorMessage)
  }

  if (max !== undefined) {
    schema = schema.max(max, errorMessage)
  }

  return schema.transform((val) => {
    if (allowHtml) {
      return sanitizeHtml(val)
    }
    return val
  })
}

/**
 * Sanitize and validate an object against a schema
 */
export function sanitizeAndValidate<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context = "validation",
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const result = schema.safeParse(data)
    if (!result.success) {
      return { success: false, errors: result.error }
    }
    return { success: true, data: result.data }
  } catch (error) {
    logger.error(`Validation error in ${context}`, {
      context,
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false }
  }
}

/**
 * Sanitize a filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and limit to alphanumeric, dash, underscore, and dot
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\.{2,}/g, ".")
    .trim()
}

/**
 * Sanitize a URL to prevent open redirect vulnerabilities
 */
export function sanitizeRedirectUrl(url: string, allowedDomains: string[] = []): string | null {
  try {
    const parsedUrl = new URL(url)

    // Check if URL is relative (same-origin)
    if (parsedUrl.origin === "null" || !parsedUrl.host) {
      return url
    }

    // Check if domain is in allowed list
    const isAllowedDomain = allowedDomains.some(
      (domain) => parsedUrl.host === domain || parsedUrl.host.endsWith(`.${domain}`),
    )

    if (isAllowedDomain) {
      return url
    }

    // If not allowed, return null or a default URL
    return null
  } catch (error) {
    // If URL is invalid, return null
    return null
  }
}

