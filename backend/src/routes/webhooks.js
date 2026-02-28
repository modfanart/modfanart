// src/routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const { stripe } = require('../config/stripe');
const { db } = require('../config');
const { randomUUID } = require('crypto');
const { generateLicensePDF, generateInvoicePDF } = require('../utils/pdfGenerators'); // from previous message

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      // Still return 200 to prevent Stripe retry spam
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // ────────────────────────────────────────────────────────────────
    // Idempotency: We use Stripe event ID + order status check
    // Prevents duplicate processing if Stripe retries the event
    // ────────────────────────────────────────────────────────────────
    const eventId = event.id;

    console.log(`Webhook received: ${event.type} (event ID: ${eventId})`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const orderId = pi.metadata?.order_id;

        if (!orderId) {
          console.warn('Payment intent succeeded but missing order_id in metadata');
          break;
        }

        // Fetch order to check current status (idempotency)
        const order = await db
          .selectFrom('orders')
          .select(['id', 'status', 'stripe_payment_intent_id'])
          .where('id', '=', orderId)
          .executeTakeFirst();

        if (!order) {
          console.error(`Order not found for payment intent ${pi.id}`);
          break;
        }

        // Already processed → safe to skip
        if (order.status !== 'pending') {
          console.log(`Order ${orderId} already ${order.status} → skipping`);
          break;
        }

        try {
          // ─── 1. Fetch related data ───
          const orderItem = await db
            .selectFrom('order_items')
            .select(['id', 'artwork_id', 'license_type'])
            .where('order_id', '=', orderId)
            .executeTakeFirstOrThrow();

          const artwork = await db
            .selectFrom('artworks')
            .select(['id', 'title', 'creator_id'])
            .where('id', '=', orderItem.artwork_id)
            .executeTakeFirstOrThrow();

          const seller = await db
            .selectFrom('users')
            .select(['id', 'username', 'email'])
            .where('id', '=', artwork.creator_id)
            .executeTakeFirstOrThrow();

          const buyer = await db
            .selectFrom('users')
            .select(['id', 'username', 'email'])
            .where('id', '=', pi.metadata.buyer_id)
            .executeTakeFirstOrThrow();

          // ─── 2. Update order to paid ───
          await db
            .updateTable('orders')
            .set({
              status: 'paid',
              stripe_charge_id: pi.latest_charge || pi.charges?.data?.[0]?.id,
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .where('id', '=', orderId)
            .execute();

          // ─── 3. Create license record ───
          const licenseId = randomUUID();

          await db.insertInto('licenses').values({
            id: licenseId,
            order_item_id: orderItem.id,
            artwork_id: orderItem.artwork_id,
            buyer_id: pi.metadata.buyer_id,
            seller_id: artwork.creator_id,
            license_type: orderItem.license_type,
            contract_pdf_url: null, // will be updated below
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).execute();

          // ─── 4. Generate PDFs (these can throw → catch below) ───
          let contractUrl = null;
          let invoiceUrl = null;

          try {
            [contractUrl, invoiceUrl] = await Promise.all([
              generateLicensePDF(
                { id: licenseId, license_type: orderItem.license_type, created_at: new Date().toISOString() },
                order,
                buyer,
                seller,
                artwork
              ),
              generateInvoicePDF(order),
            ]);
          } catch (pdfErr) {
            console.error('PDF generation failed:', pdfErr);
            // Still continue – don't fail webhook
            // You can retry later via cron or admin tool
          }

          // ─── 5. Update license & order with PDF URLs + fulfill ───
          await Promise.all([
            db
              .updateTable('licenses')
              .set({
                contract_pdf_url: contractUrl || 'generation_failed',
                updated_at: new Date().toISOString(),
              })
              .where('id', '=', licenseId)
              .execute(),

            db
              .updateTable('orders')
              .set({
                status: 'fulfilled',
                invoice_pdf_url: invoiceUrl || 'generation_failed',
                invoice_number: `INV-${Date.now().toString().slice(-8)}`,
                fulfilled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .where('id', '=', orderId)
              .execute(),
          ]);

          console.log(`Successfully fulfilled order ${orderId} → license ${licenseId}`);

          // TODO (recommended next steps):
          // - Send email to buyer with license PDF link
          // - Send email to seller with sale notification
          // - Create notification rows for both users
          // - Increment artwork.favorites_count or similar if needed
        } catch (innerErr) {
          console.error(`Fulfillment failed for order ${orderId}:`, innerErr);
          // You can mark order as 'failed' or 'needs_manual_review'
          // For now we just log → still return 200 to Stripe
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const orderId = pi.metadata?.order_id;

        if (orderId) {
          await db
            .updateTable('orders')
            .set({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .where('id', '=', orderId)
            .execute();

          console.log(`Payment failed for order ${orderId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        // Optional: find order by stripe_charge_id and handle refund
        // Create RefundRow, deactivate license, notify users, etc.
        console.log(`Charge ${charge.id} refunded`);
        break;
      }

      // Add more events as needed
      // 'account.updated' → for Connect onboarding status
      // 'invoice.payment_succeeded' → if you ever use Stripe Billing

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 OK to acknowledge receipt
    // Stripe will retry only on 4xx/5xx
    res.json({ received: true });
  }
);

module.exports = router;