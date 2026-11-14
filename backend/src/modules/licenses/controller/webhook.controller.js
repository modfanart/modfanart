// src/controllers/webhook.controller.js
const OrderFulfillmentService = require("../services/order-fullfillment.service");
const { stripe } = require("../../../config/stripe");

class WebhookController {
  static async handleStripeWebhook(req, res) {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);

      return res.status(400).json({
        error: `Webhook Error: ${err.message}`,
      });
    }

    const eventId = event.id;

    console.log(`Webhook received: ${event.type} (event ID: ${eventId})`);

    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;

          await OrderFulfillmentService.fulfillOrder(paymentIntent);

          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          const raw =
            paymentIntent.metadata?.order_ids ||
            paymentIntent.metadata?.order_id;

          for (const orderId of (raw || "").split(",").filter(Boolean)) {
            await OrderFulfillmentService.markOrderAsFailed(orderId);
          }

          break;
        }

        case "charge.refunded": {
          const charge = event.data.object;

          await OrderFulfillmentService.handleRefund(charge);

          break;
        }

        // GA-18: chargebacks used to be ignored.
        case "charge.dispute.created":
        case "charge.dispute.updated":
        case "charge.dispute.closed": {
          await OrderFulfillmentService.handleDispute(event.data.object);

          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error);

      // BUG FIX: this returned 200 even when fulfilment failed, so Stripe
      // never retried and a paid order could stay unfulfilled forever.
      // Fulfilment is idempotent (orders are claimed atomically), so a
      // 500 here is safe: Stripe retries with backoff.
      return res.status(500).json({ received: false });
    }

    return res.json({
      received: true,
    });
  }
}

module.exports = WebhookController;
