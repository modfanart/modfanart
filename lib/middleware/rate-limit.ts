import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Simple in-memory store for rate limiting
// In production, use Redis (e.g., Upstash) or another distributed store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000);
export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  identifyBot?: boolean;
}

export const defaultRateLimitOptions: Required<RateLimitOptions> = {
  limit: 60, // 60 requests
  windowMs: 60 * 1000, // per minute
  keyGenerator: (req: NextRequest) => {
    const forwarded = req.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || 'unknown';
  },
  skipSuccessfulRequests: false,
  identifyBot: true,
};

/**
 * Rate limiting middleware for Next.js API routes
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const opts = { ...defaultRateLimitOptions, ...options };

  // Ensure keyGenerator is always a function
  const keyGenerator = opts.keyGenerator ?? defaultRateLimitOptions.keyGenerator;

  return async function rateLimitMiddleware(req: NextRequest) {
    const key = keyGenerator(req);
    const now = Date.now();
    const requestId = crypto.randomUUID();

    // Check for bot patterns in user agent
    const userAgent = req.headers.get('user-agent') ?? '';
    const isSuspectedBot = opts.identifyBot && (/bot|crawl|spider/i.test(userAgent) || !userAgent);

    // Apply stricter limits for suspected bots
    const actualLimit = isSuspectedBot ? Math.floor(opts.limit / 5) : opts.limit;

    // Initialize or update count
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + opts.windowMs,
      };
    } else {
      store[key].count++;
    }

    // Calculate remaining requests and time until reset (in seconds)
    const remaining = Math.max(0, actualLimit - store[key].count);
    const reset = Math.ceil((store[key].resetTime - now) / 1000);

    // Set standard rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', actualLimit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', reset.toString());

    // Rate limit exceeded
    if (store[key].count > actualLimit) {
      logger.warn(`Rate limit exceeded for ${key}`, {
        context: 'rate-limit',
        requestId,
        data: {
          ip: key,
          path: req.nextUrl.pathname,
          userAgent,
          isSuspectedBot,
          count: store[key].count,
          limit: actualLimit,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests, please try again later',
          requestId,
        },
        { status: 429, headers }
      );
    }

    // Warn when approaching limit
    if (store[key].count > actualLimit * 0.8) {
      logger.info(`Rate limit approaching for ${key}`, {
        context: 'rate-limit',
        requestId,
        data: {
          ip: key,
          path: req.nextUrl.pathname,
          count: store[key].count,
          limit: actualLimit,
          remaining,
        },
      });
    }

    // Proceed to route handler
    return null;
  };
}
