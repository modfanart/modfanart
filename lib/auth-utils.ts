import type { NextRequest } from "next/server"
import { logger } from "@/lib/logger"
import { jwtVerify } from "jose"

// Constants
const AUTH_COOKIE_NAME = "authToken"
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"

/**
 * Checks if authentication should be bypassed (for development)
 */
export function shouldBypassAuth(): boolean {
  return process.env.BYPASS_AUTH === "true" && process.env.NODE_ENV !== "production"
}

/**
 * Checks if a request is authenticated
 */
export async function isRequestAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    // If auth is bypassed, consider the request authenticated
    if (shouldBypassAuth()) {
      logger.debug("Authentication bypassed due to BYPASS_AUTH", { path: request.nextUrl.pathname })
      return true
    }

    // Check for auth token in cookies
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      logger.debug("No auth token found in cookies", { path: request.nextUrl.pathname })
      return false
    }

    // Verify the token
    try {
      // If using JWT_SECRET, verify the token
      if (JWT_SECRET) {
        const secret = new TextEncoder().encode(JWT_SECRET)
        await jwtVerify(token, secret)
        logger.debug("JWT token verified successfully", { path: request.nextUrl.pathname })
        return true
      }

      // For demo purposes, just check if the token exists
      logger.debug("Token exists (no verification in demo mode)", { path: request.nextUrl.pathname })
      return true
    } catch (error) {
      logger.warn("Invalid auth token", { error, path: request.nextUrl.pathname })
      return false
    }
  } catch (error) {
    logger.error("Error checking authentication", { error, path: request.nextUrl.pathname })
    return false
  }
}

/**
 * Checks if a request has a specific role
 */
export async function requestHasRole(request: NextRequest, role: string): Promise<boolean> {
  try {
    // If auth is bypassed, consider the request to have the role
    if (shouldBypassAuth()) {
      logger.debug("Role check bypassed due to BYPASS_AUTH", { role, path: request.nextUrl.pathname })
      return true
    }

    // Check for auth token in cookies
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      logger.debug("No auth token found in cookies for role check", { role, path: request.nextUrl.pathname })
      return false
    }

    // In a real app, you would decode the JWT and check the role
    // For now, we'll just return true for demo purposes
    logger.debug("Role check passed (demo mode)", { role, path: request.nextUrl.pathname })
    return true
  } catch (error) {
    logger.error("Error checking role", { error, role, path: request.nextUrl.pathname })
    return false
  }
}

