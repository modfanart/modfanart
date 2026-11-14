// src/controllers/order.controller.js
const crypto = require('crypto');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const License = require('../models/license.model');
const Artwork = require('../../artworks/models/artwork.model');
const ContestEntry = require('../../contests/models/contestEntry.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../../../config');
const payoutService = require('../../payout/payout.service');
class OrderController {
  // POST /orders (create from license purchase)
  static async createLicenseOrder(req, res) {
    try {
      const { artworkId, licenseType } = req.body;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork || artwork.status !== 'published') {
        return res.status(404).json({ error: 'Artwork not available' });
      }

      const tier = await db
        .selectFrom('artwork_pricing_tiers')
        .selectAll()
        .where('artwork_id', '=', artworkId)
        .where('license_type', '=', licenseType)
        .where('is_active', '=', true)
        .executeTakeFirst();

      if (!tier)
        return res.status(404).json({ error: 'Pricing tier not found' });

      const amountCents = tier.price_usd_cents;

      const order = await Order.create({
        order_number: `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        buyer_id: req.user.id,
        seller_id: artwork.creator_id,
        source_type: 'license_purchase',
        source_id: artworkId,
        status: 'pending',
        currency: 'USD',
        subtotal_cents: amountCents,
        platform_fee_cents: Math.round(amountCents * 0.1), // 10% example
        total_cents: amountCents + Math.round(amountCents * 0.1),
      });

      await OrderItem.create(order.id, {
        artwork_id: artworkId,
        item_type: 'license',
        // payouts are per line item; without this the artist was never owed
        seller_id: artwork.creator_id,
        license_type: licenseType,
        unit_price_cents: amountCents,
        quantity: 1,
        description: `${licenseType} license for "${artwork.title}"`,
      });

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total_cents,
        currency: 'usd',
        metadata: { order_id: order.id },
        payment_method_types: ['card'],
      });

      res.json({
        order,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  // POST /orders/:id/confirm (webhook or frontend confirmation)
  static async confirmOrder(req, res) {
    try {
      const { id } = req.params;
      const { paymentIntentId } = req.body;

      const order = await Order.findById(id);
      if (!order || order.status !== 'pending') {
        return res.status(400).json({ error: 'Order not pending' });
      }

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId is required' });
      }
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }
      // The intent must be this order's, for this order's amount; otherwise
      // any succeeded intent could confirm any order.
      if (
        (paymentIntent.metadata?.order_id && paymentIntent.metadata.order_id !== order.id) ||
        Number(paymentIntent.amount_received ?? paymentIntent.amount) !== Number(order.total_cents)
      ) {
        return res.status(400).json({ error: 'Payment does not match this order' });
      }

      const items = await OrderItem.findByOrderId(order.id);
      // Was `await OrderItem.findByOrderId(order.id)[0]`, which indexed the
      // Promise: item was always undefined, so the order was marked paid and
      // then the request crashed before any licence was issued.
      const item = items[0];
      if (!item) {
        return res.status(400).json({ error: 'Order has no items' });
      }

      await Order.markAsPaid(
        order.id,
        paymentIntentId,
        // `charges` was removed from PaymentIntents in current API versions.
        paymentIntent.latest_charge ?? paymentIntent.charges?.data?.[0]?.id ?? null
      );

      const contractPdf = 'https://example.com/contract.pdf'; // TODO: generate PDF

      await License.issue(
        item.id,
        item.artwork_id,
        order.buyer_id,
        order.seller_id,
        item.license_type,
        contractPdf,
        null // perpetual
      );

      // Seller earnings go through the payout ledger like every other sale
      // (fee from platform_fee_rules, paid via Ledger → Payouts with
      // separate approval). This used to send a Stripe transfer directly
      // with a hard-coded 10% fee, and crashed first on an undefined `User`.
      try {
        await payoutService.generatePayoutsForOrder(order.id);
      } catch (payoutErr) {
        console.error(`Payout generation failed for order ${order.id}:`, payoutErr);
      }

      res.json({ message: 'Order confirmed, license issued' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to confirm order' });
    }
  }

  // GET /orders/me (user's orders)
  static async getMyOrders(req, res) {
    try {
      const orders = await db
        .selectFrom('orders')
        .selectAll()
        .where('buyer_id', '=', req.user.id)
        .orderBy('created_at', 'desc')
        .execute();

      res.json({ orders });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
}

module.exports = OrderController;
