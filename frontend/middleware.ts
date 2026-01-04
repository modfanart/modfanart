// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// ── Configuration ────────────────────────────────────────────────────────────

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

const API_PUBLIC_PATHS = ['/api/auth/', '/api/stripe/webhooks', '/api/health'];

const ADMIN_PATHS = ['/admin/', '/api/admin/'];

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per IP per minute (adjust as needed)
};

const SECURE_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://*.stripe.com",
    "frame-ancestors 'none'",
  ].join('; '),
};

// Simple in-memory rate limiter (for development / low traffic)
// In production → use Upstash, Redis, or Vercel KV
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ── Helpers ─────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwarded ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('true-client-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }

  if (entry.count >= RATE_LIMIT.max) {
    return true;
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return false;
}

function isSuspiciousRequest(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') || '';
  const pathname = req.nextUrl.pathname;

  return (
    !ua ||
    /sqlmap|nikto|scanner|bot|spider|crawler/i.test(ua) ||
    pathname.includes('..') ||
    pathname.includes('//') ||
    pathname.includes(';') ||
    pathname.includes('<script') ||
    pathname.includes('UNION SELECT') // basic SQLi pattern
  );
}

// ── Main Middleware ─────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestId = crypto.randomUUID();

  // 1. Skip entirely for static assets, images, etc.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') || // ← CRITICAL: skip ALL API routes
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // 2. Apply security headers to every response
  const response = NextResponse.next();
  Object.entries(SECURE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set('X-Request-ID', requestId);

  // 3. Suspicious request blocking (before rate limiting)
  if (isSuspiciousRequest(request)) {
    logger.warn('Blocked suspicious request', {
      requestId,
      pathname,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent'),
    });

    return new NextResponse('Forbidden', {
      status: 403,
      headers: response.headers,
    });
  }

  // 4. Rate limiting (only for non-API paths since API is skipped above)
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    logger.warn('Rate limit exceeded', { requestId, ip, pathname });
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { ...response.headers, 'Retry-After': '60' },
    });
  }

  // 5. Future: Add auth / role checks here if needed
  // Example:
  // if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
  //   const hasAdmin = await hasAdminRole(request);
  //   if (!hasAdmin) return NextResponse.redirect(new URL('/login', request.url));
  // }

  return response;
}

// ── Config ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - API routes (explicitly excluded above anyway)
     * - Next.js internals
     * - Static files
     * - Public assets
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
