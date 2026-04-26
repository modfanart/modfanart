// src/controllers/order.controller.js
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const License = require('../models/license.model');
const Artwork = require('../models/artwork.model');
const ContestEntry = require('../models/contestEntry.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../config');
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

      const amountCents = tier.price_inr_cents; // or USD logic

      const order = await Order.create({
        order_number: `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        buyer_id: req.user.id,
        seller_id: artwork.creator_id,
        source_type: 'license_purchase',
        source_id: artworkId,
        status: 'pending',
        currency: 'INR',
        subtotal_cents: amountCents,
        platform_fee_cents: Math.round(amountCents * 0.1), // 10% example
        total_cents: amountCents + Math.round(amountCents * 0.1),
      });

      await OrderItem.create(order.id, {
        artwork_id: artworkId,
        license_type: licenseType,
        unit_price_cents: amountCents,
        quantity: 1,
        description: `${licenseType} license for "${artwork.title}"`,
      });

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total_cents,
        currency: 'inr',
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

      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }

      await Order.markAsPaid(
        order.id,
        paymentIntentId,
        paymentIntent.charges.data[0]?.id
      );

      // Issue license
      const item = await OrderItem.findByOrderId(order.id)[0];
      const contractPdf = 'https://example.com/contract.pdf'; // generate PDF

      await License.issue(
        item.id,
        item.artwork_id,
        order.buyer_id,
        order.seller_id,
        item.license_type,
        contractPdf,
        null // perpetual
      );

      // Queue payout to seller (via Stripe Connect)
      if (order.seller_id) {
        const seller = await User.findById(order.seller_id);
        if (seller.stripe_connect_id) {
          await stripe.transfers.create({
            amount: Math.round(order.subtotal_cents * 0.9), // after 10% fee
            currency: 'inr',
            destination: seller.stripe_connect_id,
            description: `Payout for order ${order.order_number}`,
            metadata: { order_id: order.id },
          });
        }
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
