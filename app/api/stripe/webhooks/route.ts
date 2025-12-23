import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/middleware/rate-limit"

// Initialize Stripe with the secret key
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  })
}

// This is your Stripe webhook secret for testing your endpoint locally
const getWebhookSecret = () => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured")
  }
  return webhookSecret
}

// Rate limit options for Stripe webhooks
// More permissive since these come from Stripe
const stripeWebhookRateLimitOptions = {
  limit: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
  // Skip successful requests to avoid rate limiting legitimate webhook calls
  skipSuccessfulRequests: true,
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  logger.info(`Stripe webhook received`, {
    context: "stripe-webhook",
    requestId,
    timestamp: new Date().toISOString(),
  })

  try {
    // Apply rate limiting - but more permissive for webhooks
    const rateLimitResult = await rateLimit(stripeWebhookRateLimitOptions)(req)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Check for Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error("Stripe environment variables are not configured", {
        context: "stripe-webhook",
        requestId,
        missingVars: [
          !process.env.STRIPE_SECRET_KEY ? "STRIPE_SECRET_KEY" : null,
          !process.env.STRIPE_WEBHOOK_SECRET ? "STRIPE_WEBHOOK_SECRET" : null,
        ].filter(Boolean),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Webhook service is not configured",
          requestId,
        },
        { status: 500 },
      )
    }

    // Get the raw request body as text
    let buf
    try {
      buf = await req.text()
    } catch (error) {
      logger.error("Failed to read request body", {
        context: "stripe-webhook",
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Failed to read request body",
          requestId,
        },
        { status: 400 },
      )
    }

    const sig = req.headers.get("stripe-signature")

    if (!sig) {
      logger.error("Stripe signature missing", {
        context: "stripe-webhook",
        requestId,
        headers: Object.fromEntries(req.headers.entries()),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Stripe signature missing",
          requestId,
        },
        { status: 400 },
      )
    }

    // Initialize Stripe
    let stripe
    try {
      stripe = getStripe()
    } catch (error) {
      logger.error("Failed to initialize Stripe", {
        context: "stripe-webhook",
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Payment service initialization failed",
          requestId,
        },
        { status: 500 },
      )
    }

    // Get webhook secret
    let webhookSecret
    try {
      webhookSecret = getWebhookSecret()
    } catch (error) {
      logger.error("Failed to get webhook secret", {
        context: "stripe-webhook",
        requestId,
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        {
          success: false,
          error: "Webhook configuration error",
          requestId,
        },
        { status: 500 },
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
      logger.info(`Webhook event verified: ${event.type}`, {
        context: "stripe-webhook",
        requestId,
        eventType: event.type,
        eventId: event.id,
      })
    } catch (err) {
      const error = err as Error
      logger.error(`Webhook signature verification failed`, {
        context: "stripe-webhook",
        requestId,
        error: error.message,
        signature: sig.substring(0, 20) + "...", // Log partial signature for debugging
      })
      return NextResponse.json(
        {
          success: false,
          error: `Webhook Error: ${error.message}`,
          requestId,
        },
        { status: 400 },
      )
    }

    // Handle the event based on its type
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          // Handle successful checkout
          logger.info(`Checkout completed`, {
            context: "stripe-webhook",
            requestId,
            data: {
              checkoutSessionId: checkoutSession.id,
              clientReferenceId: checkoutSession.client_reference_id,
              customerId: checkoutSession.customer,
              paymentStatus: checkoutSession.payment_status,
            },
          })

          // Here you would typically:
          // 1. Retrieve the user from your database
          // 2. Update their subscription status
          // 3. Grant them access to paid features
          // 4. Send a confirmation email
          break
        }

        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription
          // Handle new subscription
          logger.info(`New subscription created`, {
            context: "stripe-webhook",
            requestId,
            data: {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            },
          })

          // Here you would typically:
          // 1. Store the subscription details in your database
          // 2. Update the user's subscription status
          // 3. Send a welcome email
          break
        }

        case "customer.subscription.updated": {
          const updatedSubscription = event.data.object as Stripe.Subscription
          // Handle subscription update
          logger.info(`Subscription updated`, {
            context: "stripe-webhook",
            requestId,
            data: {
              subscriptionId: updatedSubscription.id,
              customerId: updatedSubscription.customer,
              status: updatedSubscription.status,
              currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
            },
          })

          // Here you would typically:
          // 1. Update the subscription details in your database
          // 2. Handle plan changes, upgrades, downgrades
          // 3. Send a confirmation email if needed
          break
        }

        case "customer.subscription.deleted": {
          const deletedSubscription = event.data.object as Stripe.Subscription
          // Handle subscription cancellation
          logger.info(`Subscription cancelled`, {
            context: "stripe-webhook",
            requestId,
            data: {
              subscriptionId: deletedSubscription.id,
              customerId: deletedSubscription.customer,
              cancelAt: deletedSubscription.cancel_at
                ? new Date(deletedSubscription.cancel_at * 1000).toISOString()
                : null,
            },
          })

          // Here you would typically:
          // 1. Update the subscription status in your database
          // 2. Revoke access to paid features
          // 3. Send a cancellation confirmation email
          // 4. Maybe offer a win-back discount
          break
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice
          logger.info(`Payment succeeded`, {
            context: "stripe-webhook",
            requestId,
            data: {
              invoiceId: invoice.id,
              customerId: invoice.customer,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              subscriptionId: invoice.subscription,
            },
          })

          // Here you would typically:
          // 1. Record the payment in your database
          // 2. Send a receipt email
          break
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice
          logger.warn(`Payment failed`, {
            context: "stripe-webhook",
            requestId,
            data: {
              invoiceId: invoice.id,
              customerId: invoice.customer,
              amount: invoice.amount_due,
              currency: invoice.currency,
              subscriptionId: invoice.subscription,
              attemptCount: invoice.attempt_count,
            },
          })

          // Here you would typically:
          // 1. Record the failed payment
          // 2. Notify the user
          // 3. Maybe implement a retry strategy
          break
        }

        default:
          logger.info(`Unhandled event type: ${event.type}`, {
            context: "stripe-webhook",
            requestId,
            eventId: event.id,
          })
      }
    } catch (error) {
      logger.error(`Error processing webhook event`, {
        context: "stripe-webhook",
        requestId,
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      // We don't want to return an error status here because Stripe will retry the webhook
      // Instead, log the error and return a 200 response
    }

    logger.info(`Webhook processed successfully`, {
      context: "stripe-webhook",
      requestId,
      data: {
        eventType: event.type,
        processingTime: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      received: true,
      requestId,
      processingTime: Date.now() - startTime,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log the error but don't expose details to the client
    logger.error("Error processing webhook", {
      context: "stripe-webhook",
      requestId,
      data: {
        error: errorMessage,
        stack: errorStack,
        processingTime: Date.now() - startTime,
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        requestId,
        processingTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

