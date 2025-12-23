import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export interface AuthOptions {
  requiredRole?: string | string[]
  allowAnonymous?: boolean
}

/**
 * Authentication middleware for Next.js API routes
 */
export async function requireAuth(req: NextRequest, options: AuthOptions = {}) {
  const requestId = crypto.randomUUID()
  const { requiredRole, allowAnonymous = false } = options

  // Skip auth check if anonymous access is allowed
  if (allowAnonymous) {
    return null
  }

  try {
    // Get the session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      logger.warn("Unauthorized access attempt", {
        context: "auth-middleware",
        requestId,
        data: {
          path: req.nextUrl.pathname,
          ip: req.ip || req.headers.get("x-forwarded-for") || "unknown",
          userAgent: req.headers.get("user-agent"),
        },
      })

      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          requestId,
        },
        { status: 401 },
      )
    }

    // Check role if required
    if (requiredRole) {
      const userRole = session.user.role || "user"
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

      if (!requiredRoles.includes(userRole)) {
        logger.warn("Insufficient permissions", {
          context: "auth-middleware",
          requestId,
          data: {
            userId: session.user.id,
            userRole,
            requiredRoles,
            path: req.nextUrl.pathname,
          },
        })

        return NextResponse.json(
          {
            success: false,
            error: "Insufficient permissions",
            requestId,
          },
          { status: 403 },
        )
      }
    }

    // Authentication successful
    return null
  } catch (error) {
    logger.error("Authentication error", {
      context: "auth-middleware",
      requestId,
      data: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: req.nextUrl.pathname,
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Authentication error",
        requestId,
      },
      { status: 500 },
    )
  }
}

