const { stripe } = require('../config/stripe');
const { db } = require('../config');
const { sql } = require('kysely');
const { randomUUID } = require('crypto');

class LicensePurchaseController {
  static async createCheckoutSession(req, res) {
    try {
      const buyerId = req.user.id;
      const { artwork_id, pricing_tier_id } = req.body;

      // ─── 1. Fetch artwork + tier + seller ───
      const tier = await db
        .selectFrom('artwork_pricing_tiers')
        .selectAll()
        .where('id', '=', pricing_tier_id)
        .where('artwork_id', '=', artwork_id)
        .where('is_active', '=', true)
        .executeTakeFirst();

      if (!tier)
        return res
          .status(404)
          .json({ error: 'Pricing tier not found or inactive' });

      const artwork = await db
        .selectFrom('artworks')
        .select('creator_id')
        .where('id', '=', artwork_id)
        .executeTakeFirstOrThrow();

      const seller = await db
        .selectFrom('users')
        .select(['stripe_connect_id', 'location'])
        .where('id', '=', artwork.creator_id)
        .executeTakeFirstOrThrow();

      if (!seller.stripe_connect_id) {
        return res
          .status(400)
          .json({ error: 'Creator has not connected Stripe account yet' });
      }

      // ─── 2. Currency & tax logic (India-focused) ───
      const buyer = await db
        .selectFrom('users')
        .select('location')
        .where('id', '=', buyerId)
        .executeTakeFirst();

      const useINR =
        (buyer?.location?.includes('IN') || false) && tier.price_inr_cents > 0;
      const amountCents = useINR ? tier.price_inr_cents : tier.price_usd_cents;
      const currency = useINR ? 'inr' : 'usd';

      const platformFeePercent = 0.1; // 10%
      const platformFeeCents = Math.floor(amountCents * platformFeePercent);

      // GST 18% example for India (simplified – real tax logic is more complex)
      const taxRate = useINR ? 0.18 : 0;
      const taxCents = Math.floor(amountCents * taxRate);
      const totalCents = amountCents + taxCents;

      // ─── 3. Create pending Order ───
      const orderId = randomUUID();
      const orderItemId = randomUUID();

      await db
        .insertInto('orders')
        .values({
          id: orderId,
          order_number: `LIC-${Date.now().toString().slice(-8)}`,
          buyer_id: buyerId,
          seller_id: artwork.creator_id,
          source_type: 'license_purchase',
          source_id: artwork_id,
          status: 'pending',
          currency,
          subtotal_cents: amountCents,
          platform_fee_cents: platformFeeCents,
          tax_cents: taxCents,
          total_cents: totalCents,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      await db
        .insertInto('order_items')
        .values({
          id: orderItemId,
          order_id: orderId,
          artwork_id,
          license_type: tier.license_type,
          unit_price_cents: amountCents,
          quantity: 1,
          description: `${tier.license_type} license for "${artwork.title || 'Artwork'}"`,
          metadata: { pricing_tier_id },
        })
        .execute();

      // ─── 4. Create Stripe PaymentIntent (Destination Charge) ───
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency,
        payment_method_types: ['card'],
        metadata: {
          order_id: orderId,
          buyer_id: buyerId,
          artwork_id,
          pricing_tier_id,
        },
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: seller.stripe_connect_id,
        },
      });

      await db
        .updateTable('orders')
        .set({ stripe_payment_intent_id: paymentIntent.id })
        .where('id', '=', orderId)
        .execute();

      res.json({
        clientSecret: paymentIntent.client_secret,
        orderId,
        amount: totalCents,
        currency,
      });
    } catch (err) {
      console.error('Checkout creation failed:', err);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
}

module.exports = LicensePurchaseController;
