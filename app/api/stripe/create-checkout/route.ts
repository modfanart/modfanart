import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { sanitizeAndValidate, sanitizeRedirectUrl } from '@/lib/utils/sanitize';

// Define validation schema for checkout creation
const CheckoutSchema = z.object({
  tier: z.string().min(1, 'Tier is required'),
  planId: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

// Initialize Stripe with the secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });
};

// Rate limit options for Stripe checkout API
const stripeCheckoutRateLimitOptions = {
  limit: 10, // 10 requests
  windowMs: 60 * 1000, // per minute
};

// Allowed domains for redirect URLs
const ALLOWED_DOMAINS = [
  'localhost',
  'mod-platform.vercel.app',
  'mod-platform-staging.vercel.app',
  'mod-platform-prod.vercel.app',
];

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(`Stripe checkout creation request received`, {
    context: 'stripe-checkout-api',
    requestId,
    timestamp: new Date().toISOString(),
  });

  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(stripeCheckoutRateLimitOptions)(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Apply authentication - require user to be logged in
    const authResult = await requireAuth(req);
    if (authResult) {
      return authResult;
    }

    // Check for Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('STRIPE_SECRET_KEY is not configured', {
        context: 'stripe-checkout-api',
        requestId,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service is not configured',
          requestId,
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      logger.warn('Failed to parse request body', {
        context: 'stripe-checkout-api',
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          requestId,
        },
        { status: 400 }
      );
    }

    // Validate input using Zod
    const validation = sanitizeAndValidate(body, CheckoutSchema, 'stripe-checkout-api');
    if (!validation.success) {
      logger.warn('Invalid checkout data', {
        context: 'stripe-checkout-api',
        requestId,
        errors: validation.errors?.issues,
        body: JSON.stringify(body).substring(0, 200) + '...', // Log partial body for debugging
      });
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

    const { tier, planId, userId, returnUrl } = validation.data;

    // Sanitize return URL to prevent open redirect vulnerabilities
    const sanitizedReturnUrl = returnUrl
      ? sanitizeRedirectUrl(returnUrl, ALLOWED_DOMAINS)
      : process.env.NEXT_PUBLIC_APP_URL;

    if (returnUrl && !sanitizedReturnUrl) {
      logger.warn(`Potentially malicious return URL blocked`, {
        context: 'stripe-checkout-api',
        requestId,
        data: { returnUrl },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid return URL',
          requestId,
        },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    const authenticatedUserId = session?.user?.id;
    const userRole = session?.user?.role || 'user';

    // Verify the user is creating a checkout for themselves or has admin rights
    if (authenticatedUserId !== userId && userRole !== 'admin') {
      logger.warn(`Unauthorized checkout creation attempt`, {
        context: 'stripe-checkout-api',
        requestId,
        data: {
          authenticatedUserId,
          requestedUserId: userId,
          role: userRole,
        },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'You can only create checkout sessions for yourself',
          requestId,
        },
        { status: 403 }
      );
    }

    // Initialize Stripe
    let stripe;
    try {
      stripe = getStripe();
    } catch (error) {
      logger.error('Failed to initialize Stripe', {
        context: 'stripe-checkout-api',
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Payment service initialization failed',
          requestId,
        },
        { status: 500 }
      );
    }

    // Define pricing based on tier
    let priceId: string;
    let mode: 'subscription' | 'payment' = 'subscription';

    // In a real app, these would be stored in a database or environment variables
    switch (tier) {
      case 'premium_artist':
        // Premium Artist tier (monthly subscription)
        priceId = planId || 'price_1QzXUuL76gSQx4vuNVFc3Gbjw'; // Replace with actual Stripe price ID
        break;
      case 'enterprise':
        // Enterprise tier (annual subscription)
        priceId = planId || 'price_1QzXUuL76gSQx4vuVksQf9aF6'; // Replace with actual Stripe price ID
        break;
      case 'one_time_license':
        // One-time license fee
        priceId = planId || 'price_1QzXUuL76gSQx4vuVksQf9aF6'; // Replace with actual Stripe price ID
        mode = 'payment';
        break;
      default:
        logger.warn(`Invalid tier specified`, {
          context: 'stripe-checkout-api',
          requestId,
          data: { tier },
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid tier',
            requestId,
          },
          { status: 400 }
        );
    }

    logger.info(`Creating Stripe checkout session`, {
      context: 'stripe-checkout-api',
      requestId,
      data: {
        userId,
        tier,
        mode,
        priceId,
      },
    });

    // Create a checkout session
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode,
        success_url: `${sanitizedReturnUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${sanitizedReturnUrl}/payment/cancel`,
        client_reference_id: userId,
        metadata: {
          tier,
          userId,
          requestId,
        },
      });
    } catch (stripeError) {
      logger.error('Stripe checkout creation failed', {
        context: 'stripe-checkout-api',
        requestId,
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
        data: {
          userId,
          tier,
          mode,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Payment service error',
          message: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
          requestId,
        },
        { status: 502 }
      );
    }

    logger.info(`Checkout session created successfully`, {
      context: 'stripe-checkout-api',
      requestId,
      data: {
        checkoutSessionId: checkoutSession.id,
        processingTime: Date.now() - startTime,
      },
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error for debugging but don't expose stack traces to client
    logger.error('Error creating checkout session', {
      context: 'stripe-checkout-api',
      requestId,
      data: {
        error: errorMessage,
        stack: errorStack,
        processingTime: Date.now() - startTime,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        message: errorMessage,
        meta: {
          requestId,
          processingTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
