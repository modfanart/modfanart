import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export interface AuthOptions {
  requiredRole?: string | string[];
  allowAnonymous?: boolean;
}

/**
 * Authentication middleware for Next.js API routes
 */
export async function requireAuth(req: NextRequest, options: AuthOptions = {}) {
  const requestId = crypto.randomUUID();
  const { requiredRole, allowAnonymous = false } = options;

  if (allowAnonymous) {
    return null;
  }

  // Safe client IP extraction
  const getClientIp = (): string => {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return first;
    }

    return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || 'unknown';
  };

  const clientIp = getClientIp();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logger.warn(
        'Unauthorized access attempt',
        {
          // Everything except 'context' goes in 'data'
          requestId,
          ip: clientIp,
          path: req.nextUrl.pathname,
          userAgent: req.headers.get('user-agent'),
        },
        {
          context: 'auth-middleware', // Only context here
        }
      );

      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    if (requiredRole) {
      const userRole = session.user.role || 'user';
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!requiredRoles.includes(userRole)) {
        logger.warn(
          'Insufficient permissions',
          {
            requestId,
            userId: session.user.id,
            userRole,
            requiredRoles,
            path: req.nextUrl.pathname,
          },
          {
            context: 'auth-middleware',
          }
        );

        return NextResponse.json(
          { success: false, error: 'Insufficient permissions', requestId },
          { status: 403 }
        );
      }
    }

    return null;
  } catch (error) {
    logger.error('Authentication error', error, {
      context: 'auth-middleware',
      data: {
        requestId,
        path: req.nextUrl.pathname,
        ip: clientIp,
      },
    });

    return NextResponse.json(
      { success: false, error: 'Authentication error', requestId },
      { status: 500 }
    );
  }
}
