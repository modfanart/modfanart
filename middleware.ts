import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/logger"

// List of public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth/(.)*", "/api/stripe/webhooks", "/api/health"]

// List of admin-only routes
const adminRoutes = ["/admin/(.*)", "/api/admin/(.*)"]

// Define route patterns - use canonical routes
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]
const protectedRoutes = ["/dashboard", "/submissions", "/settings", "/profile", "/analytics", "/earnings"]
const publicCacheableRoutes = ["/", "/for-brands", "/for-creators", "/for-artists", "/gallery", "/resources"]

// In-memory store for rate limiting (should use Redis in production)
const rateLimit = new Map<string, { count: number; timestamp: number }>()

// Mock functions for authentication and authorization (replace with your actual implementation)
async function isRequestAuthenticated(request: NextRequest): Promise<boolean> {
  // Replace with your actual authentication logic (e.g., JWT verification, session check)
  // For now, just return true for testing purposes
  return true
}

async function requestHasRole(request: NextRequest, role: string): Promise<boolean> {
  // Replace with your actual role-based access control logic
  // For now, just return true for testing purposes if the role is "admin"
  return role === "admin"
}

export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  // Add security headers to all responses
  const secureHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.stripe.com;",
  }

  // Check for suspicious request patterns
  const userAgent = request.headers.get("user-agent") || ""
  const isSuspiciousRequest =
    !userAgent ||
    userAgent.includes("sqlmap") ||
    userAgent.includes("nikto") ||
    pathname.includes("..") ||
    pathname.includes("//") ||
    pathname.includes(";") ||
    pathname.includes("<script")

  if (isSuspiciousRequest) {
    logger.warn("Suspicious request blocked", {
      context: "security-middleware",
      requestId,
      data: {
        path: pathname,
        userAgent,
        ip: request.ip || request.headers.get("x-forwarded-for") || "unknown",
      },
    })

    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403, headers: secureHeaders })
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    // This would be a more sophisticated implementation in production
    // Here we're just demonstrating the concept
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

    // Log API request for monitoring
    logger.info(`API request: ${pathname}`, {
      context: "api-middleware",
      requestId,
      data: {
        path: pathname,
        method: request.method,
        ip,
      },
    })
  }

  // Add security headers to the response
  const response = NextResponse.next()

  // Apply security headers
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add request ID for tracking
  response.headers.set("X-Request-ID", requestId)

  return response
}

/**
 * Applies security headers to the response
 */
function applySecurityHeaders(response: NextResponse) {
  // Set security headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Content Security Policy
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.stripe.com;",
    )
  }

  return response
}

/**
 * Handles rate limiting
 * @returns false if rate limited, true otherwise
 */
function handleRateLimit(request: NextRequest, response: NextResponse): boolean {
  const ip = request.ip || "unknown"
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute

  // Different limits based on route type
  let maxRequests = 100 // Default

  if (request.nextUrl.pathname.startsWith("/api")) {
    maxRequests = 50 // API endpoints
  } else if (
    authRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`))
  ) {
    maxRequests = 20 // Auth routes
  }

  // Get current rate limit data
  const current = rateLimit.get(ip) || { count: 0, timestamp: now }

  // Reset if outside window
  if (now - current.timestamp > windowMs) {
    current.count = 0
    current.timestamp = now
  }

  // Increment count
  current.count++
  rateLimit.set(ip, current)

  // Set rate limit headers
  response.headers.set("X-RateLimit-Limit", maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", Math.max(0, maxRequests - current.count).toString())
  response.headers.set("X-RateLimit-Reset", (current.timestamp + windowMs).toString())

  // Check if rate limited
  if (current.count > maxRequests) {
    logger.warn("Rate limit exceeded", { ip, path: request.nextUrl.pathname })

    const rateLimitResponse = new NextResponse(JSON.stringify({ error: "Too many requests, please try again later" }), {
      status: 429,
      headers: response.headers,
    })
    rateLimitResponse.headers.set("Retry-After", "60")

    return false
  }

  return true
}

/**
 * Handles authentication routes
 */
async function handleAuthRoutes(request: NextRequest, response: NextResponse) {
  // If user is already authenticated, redirect to dashboard
  const isAuthenticated = await isRequestAuthenticated(request)

  if (isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"

    logger.info("Redirecting authenticated user from auth route to dashboard", {
      from: request.nextUrl.pathname,
      to: url.pathname,
    })

    return NextResponse.redirect(url)
  }

  // If not authenticated, just continue (no redirect needed)
  return response
}

/**
 * Handles protected routes
 */
async function handleProtectedRoutes(request: NextRequest, response: NextResponse, isAuthRoute: boolean) {
  // Check if user is authenticated
  const isAuthenticated = await isRequestAuthenticated(request)

  if (!isAuthenticated) {
    const url = request.nextUrl.clone()

    // IMPORTANT: Prevent redirect loops by checking if we're already on an auth route
    if (isAuthRoute) {
      logger.warn("Prevented redirect loop on auth page", { path: request.nextUrl.pathname })
      return response
    }

    url.pathname = "/login"
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)

    logger.info("Redirecting unauthenticated user to login", {
      from: request.nextUrl.pathname,
      to: url.pathname,
    })

    return NextResponse.redirect(url)
  }

  // Role-based access control for specific routes
  if (request.nextUrl.pathname.startsWith("/dashboard/compliance")) {
    const hasAdminRole = await requestHasRole(request, "admin")

    if (!hasAdminRole) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"

      logger.warn("Unauthorized access attempt to admin route", {
        path: request.nextUrl.pathname,
        redirectTo: url.pathname,
      })

      return NextResponse.redirect(url)
    }
  }

  return response
}

/**
 * Handles public cacheable routes
 */
function handlePublicRoutes(request: NextRequest, response: NextResponse) {
  // Add caching headers for public routes
  response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=300")

  return response
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

