export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { getUserById } from '@/lib/db/models/user';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { sanitizeRedirectUrl } from '@/lib/utils/sanitize';

/* -------------------------------------------------------------------------- */
/*                                  Runtime                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const PortalSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  returnUrl: z.string().url().optional(),
});

/* -------------------------------------------------------------------------- */
/*                             Allowed Redirects                              */
/* -------------------------------------------------------------------------- */

const ALLOWED_DOMAINS = [
  'localhost',
  'mod-platform.vercel.app',
  'mod-platform-staging.vercel.app',
  'mod-platform-prod.vercel.app',
];

/* -------------------------------------------------------------------------- */
/*                             Stripe Singleton                               */
/* -------------------------------------------------------------------------- */

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (stripe) return stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  stripe = new Stripe(key);
  return stripe;
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info('Stripe portal request received', {
    context: 'stripe-portal-api',
    requestId,
  });

  try {
    /* ------------------------------- Auth -------------------------------- */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logger.warn('Unauthorized portal access attempt', {
        context: 'stripe-portal-api',
        requestId,
      });

      return NextResponse.json(
        { success: false, error: 'Unauthorized', requestId },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const role = session.user.role ?? 'user';

    /* ------------------------------ Body --------------------------------- */
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', requestId },
        { status: 400 }
      );
    }

    const parsed = PortalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: parsed.error.issues,
          requestId,
        },
        { status: 400 }
      );
    }

    const { customerId, returnUrl } = parsed.data;

    /* -------------------------- Authorization ---------------------------- */
    /**
     * CRITICAL SECURITY CHECK
     *
     * You MUST verify that this Stripe customer belongs to the user.
     * Replace this stub with a real DB lookup.
     */

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', requestId },
        { status: 404 }
      );
    }

    const userStripeCustomerId = user.stripeCustomerId;

    const isAdmin = role === 'admin';
    const ownsCustomer = customerId === userStripeCustomerId;
    if (!isAdmin && !ownsCustomer) {
      logger.warn('Forbidden portal access attempt', {
        context: 'stripe-portal-api',
        requestId,
        data: { userId, customerId },
      });

      return NextResponse.json({ success: false, error: 'Forbidden', requestId }, { status: 403 });
    }

    /* -------------------------- Redirect URL ----------------------------- */
    const safeReturnUrl = returnUrl
      ? sanitizeRedirectUrl(returnUrl, ALLOWED_DOMAINS)
      : process.env.NEXT_PUBLIC_APP_URL;

    if (!safeReturnUrl) {
      return NextResponse.json(
        { success: false, error: 'Invalid return URL', requestId },
        { status: 400 }
      );
    }

    /* ----------------------------- Stripe -------------------------------- */
    const stripe = getStripe();

    let portalSession: Stripe.BillingPortal.Session;

    try {
      portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: safeReturnUrl,
      });
    } catch (err) {
      logger.error('Stripe portal creation failed', {
        context: 'stripe-portal-api',
        requestId,
        error: err instanceof Error ? err.message : String(err),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Stripe service error',
          requestId,
        },
        { status: 502 }
      );
    }

    /* ------------------------------ Success ------------------------------ */
    logger.info('Stripe portal session created', {
      context: 'stripe-portal-api',
      requestId,
      portalSessionId: portalSession.id,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
      sessionId: portalSession.id,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error('Unhandled portal error', {
      context: 'stripe-portal-api',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        requestId,
      },
      { status: 500 }
    );
  }
}
