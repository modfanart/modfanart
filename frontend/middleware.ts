// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// ─────────────────────────────────────────────
// Routes config (optional future use)
// ─────────────────────────────────────────────

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/for-brands',
  '/for-creators',
  '/for-artists',
  '/gallery',
  '/resources',
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

function isSuspiciousRequest(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  const path = req.nextUrl.pathname;

  return (
    !ua ||
    /sqlmap|nikto|scanner|bot|spider|crawler/i.test(ua) ||
    path.includes('..') ||
    path.includes('//') ||
    path.includes('<script') ||
    path.includes('UNION SELECT')
  );
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestId = crypto.randomUUID();
  const ip = getClientIp(request);

  // 1. Skip Next internals + static + API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Basic suspicious request blocking (optional)
  if (isSuspiciousRequest(request)) {
    logger.warn('Blocked suspicious request', {
      requestId,
      pathname,
      ip,
    });

    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3. Attach request ID (useful for debugging/logging)
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);

  return response;
}

// ─────────────────────────────────────────────
// Matcher
// ─────────────────────────────────────────────

export const config = {
  // Exclude Next internals, API routes, and any path with a file extension
  // (static assets in /public). Without the `.*\\..*` clause, middleware runs
  // on image requests and the image optimizer's internal fetch — which carries
  // an empty user-agent — gets blocked by isSuspiciousRequest (403), breaking
  // all local next/image optimization.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
