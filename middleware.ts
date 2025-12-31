import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/(.*)',
  '/api/stripe/webhooks',
  '/api/health',
];

// List of admin-only routes
const adminRoutes = ['/admin/(.*)', '/api/admin/(.*)'];

// Define route patterns
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
const protectedRoutes = [
  '/dashboard',
  '/submissions',
  '/settings',
  '/profile',
  '/analytics',
  '/earnings',
];
const publicCacheableRoutes = [
  '/',
  '/for-brands',
  '/for-creators',
  '/for-artists',
  '/gallery',
  '/resources',
];

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

// Mock auth functions
async function isRequestAuthenticated(request: NextRequest): Promise<boolean> {
  return true; // Replace with real auth
}

async function requestHasRole(request: NextRequest, role: string): Promise<boolean> {
  return role === 'admin'; // Replace with real logic
}

// Safe IP extraction for middleware
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    if (ip) return ip;
  }
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('true-client-ip') ||
    'unknown'
  );
}

export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  const secureHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.stripe.com;",
  };

  // Suspicious request detection
  const userAgent = request.headers.get('user-agent') || '';
  const isSuspiciousRequest =
    !userAgent ||
    /sqlmap|nikto/i.test(userAgent) ||
    pathname.includes('..') ||
    pathname.includes('//') ||
    pathname.includes(';') ||
    pathname.includes('<script');

  if (isSuspiciousRequest) {
    logger.warn('Suspicious request blocked', {
      context: 'security-middleware',
      requestId,
      data: {
        path: pathname,
        userAgent,
        ip,
      },
    });

    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403, headers: secureHeaders }
    );
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    logger.info(`API request: ${pathname}`, {
      context: 'api-middleware',
      requestId,
      data: {
        path: pathname,
        method: request.method,
        ip,
      },
    });
  }

  // Start with next response
  let response = NextResponse.next();

  // Apply security headers
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('X-Request-ID', requestId);

  // You can add more logic here later (auth redirects, rate limiting, etc.)

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
