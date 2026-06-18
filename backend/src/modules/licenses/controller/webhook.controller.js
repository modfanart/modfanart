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
          const orderId = paymentIntent.metadata?.order_id;

          if (orderId) {
            await OrderFulfillmentService.markOrderAsFailed(orderId);
          }

          break;
        }

        case "charge.refunded": {
          const charge = event.data.object;

          await OrderFulfillmentService.handleRefund(charge.id);

          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error);

      // Don't return error to Stripe
      // Stripe will retry if webhook endpoint fails
    }

    return res.json({
      received: true,
    });
  }
}

module.exports = WebhookController;
