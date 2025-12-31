// app/api/stripe/create-checkout/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import crypto from 'crypto';

import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/requireAuth';
import { sanitizeAndValidate, sanitizeRedirectUrl } from '@/lib/utils/sanitize';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/* -------------------------------------------------------------------------- */
/* Schema */
/* -------------------------------------------------------------------------- */
const CheckoutSchema = z.object({
  tier: z.string().min(1, 'Tier is required'),
  planId: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  returnUrl: z.string().url().optional(),
});

/* -------------------------------------------------------------------------- */
/* Configuration */
/* -------------------------------------------------------------------------- */
const ALLOWED_DOMAINS = [
  'localhost',
  'mod-platform.vercel.app',
  'mod-platform-staging.vercel.app',
  'mod-platform-prod.vercel.app',
];

const stripeRateLimit = {
  limit: 10,
  windowMs: 60 * 1000,
};

/* -------------------------------------------------------------------------- */
/* POST Handler */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('Stripe checkout request received', {
    context: 'stripe-checkout-api',
    requestId,
  });

  try {
    // ── Lazy Stripe initialization (prevents build-time execution) ──
    let stripe: Stripe;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      logger.error('Missing STRIPE_SECRET_KEY', { requestId });
      return NextResponse.json(
        { success: false, error: 'Server configuration error', requestId },
        { status: 500 }
      );
    }

    stripe = new Stripe(stripeSecretKey, {
      // Optional: pin API version if needed
      // apiVersion: '2024-10-28.acacia',
    });

    // ── Rate limiting ──
    const limiter = rateLimit(stripeRateLimit);
    const rateLimitResponse = await limiter(req);
    if (rateLimitResponse) return rateLimitResponse;

    // ── Authentication ──
    const authResponse = await requireAuth(req);
    if (authResponse) return authResponse;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    // ── Parse & validate body ──
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', requestId },
        { status: 400 }
      );
    }

    const validation = sanitizeAndValidate(body, CheckoutSchema, 'stripe-checkout');
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid checkout data',
          details: validation.errors?.issues,
          requestId,
        },
        { status: 400 }
      );
    }

    const { tier, userId, planId, returnUrl } = validation.data;

    // ── Authorization check ──
    const authenticatedUserId = session.user.id;
    const role = session.user.role ?? 'user';

    if (authenticatedUserId !== userId && role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only create checkout sessions for yourself',
          requestId,
        },
        { status: 403 }
      );
    }

    // ── Sanitize return URL ──
    const sanitizedReturnUrl = returnUrl
      ? sanitizeRedirectUrl(returnUrl, ALLOWED_DOMAINS)
      : process.env.NEXT_PUBLIC_APP_URL;

    if (!sanitizedReturnUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid return URL', requestId },
        { status: 400 }
      );
    }

    // ── Determine Stripe price & mode ──
    let priceId: string;
    let mode: Stripe.Checkout.SessionCreateParams.Mode = 'subscription';

    switch (tier) {
      case 'premium_artist':
        priceId = planId || 'price_XXXXXXXXXXXXX';
        break;

      case 'enterprise':
        priceId = planId || 'price_YYYYYYYYYYYYY';
        break;

      case 'one_time_license':
        priceId = planId || 'price_ZZZZZZZZZZZZZ';
        mode = 'payment';
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid tier', requestId },
          { status: 400 }
        );
    }

    // ── Create Stripe Checkout Session ──
    const sessionResult = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${sanitizedReturnUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${sanitizedReturnUrl}/payment/cancel`,
      client_reference_id: userId,
      metadata: { tier, userId, requestId },
    });

    logger.info('Stripe checkout created', {
      context: 'stripe-checkout-api',
      requestId,
      checkoutSessionId: sessionResult.id,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      url: sessionResult.url,
      sessionId: sessionResult.id,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('Stripe checkout failed', {
      context: 'stripe-checkout-api',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        requestId,
      },
      { status: 500 }
    );
  }
}
