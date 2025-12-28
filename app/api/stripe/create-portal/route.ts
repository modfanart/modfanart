import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

// Define validation schema for portal creation
const PortalSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

// Initialize Stripe with the secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey); // No apiVersion → uses latest stable
};

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  logger.info(`Stripe portal creation request received`, {
    context: 'stripe-portal-api',
    requestId,
    timestamp: new Date().toISOString(),
  });

  try {
    // Check for Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.error('STRIPE_SECRET_KEY is not configured', {
        context: 'stripe-portal-api',
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

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create billing portal session', {
        context: 'stripe-portal-api',
        requestId,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          requestId,
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      logger.warn('Failed to parse request body', {
        context: 'stripe-portal-api',
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
    const validationResult = PortalSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Invalid portal data', {
        context: 'stripe-portal-api',
        requestId,
        errors: validationResult.error.issues,
        body: JSON.stringify(body).substring(0, 200) + '...', // Log partial body for debugging
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid portal data',
          details: validationResult.error.issues,
          requestId,
        },
        { status: 400 }
      );
    }

    const { customerId, returnUrl } = validationResult.data;

    // Verify the user is accessing their own customer portal or has admin rights
    // In a real app, you would check if the customerId belongs to the current user
    logger.info(`User accessing customer portal`, {
      context: 'stripe-portal-api',
      requestId,
      data: {
        userId: session.user.id || session.user.email,
        customerId,
        role: session.user.role || 'user',
      },
    });

    // Initialize Stripe
    let stripe;
    try {
      stripe = getStripe();
    } catch (error) {
      logger.error('Failed to initialize Stripe', {
        context: 'stripe-portal-api',
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

    // Create a billing portal session
    let portalSession;
    try {
      portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });
    } catch (stripeError) {
      logger.error('Stripe portal creation failed', {
        context: 'stripe-portal-api',
        requestId,
        error: stripeError instanceof Error ? stripeError.message : String(stripeError),
        data: { customerId },
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

    logger.info(`Billing portal session created successfully`, {
      context: 'stripe-portal-api',
      requestId,
      data: {
        portalSessionId: portalSession.id,
        processingTime: Date.now() - startTime,
      },
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error for debugging but don't expose stack traces to client
    logger.error('Error creating portal session', {
      context: 'stripe-portal-api',
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
        error: 'Failed to create portal session',
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
