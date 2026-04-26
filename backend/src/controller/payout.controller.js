const { stripe } = require('../config/stripe');
const { db } = require('../config');
const { randomUUID } = require('crypto');

class PayoutController {
  static async createConnectAccount(req, res) {
    try {
      const userId = req.user.id;

      const user = await db
        .selectFrom('users')
        .select(['email', 'stripe_connect_id'])
        .where('id', '=', userId)
        .executeTakeFirstOrThrow();

      if (user.stripe_connect_id) {
        return res
          .status(400)
          .json({ error: 'Stripe account already connected' });
      }

      const account = await stripe.accounts.create({
        type: 'standard',
        country: 'IN', // Default to India – you can make dynamic later
        email: user.email,
        metadata: { user_id: userId },
      });

      await db
        .updateTable('users')
        .set({
          stripe_connect_id: account.id,
          payout_method: { type: 'stripe', status: 'pending' },
        })
        .where('id', '=', userId)
        .execute();

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/payouts/refresh`,
        return_url: `${process.env.FRONTEND_URL}/payouts/success`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url });
    } catch (err) {
      console.error('Stripe connect error:', err);
      res
        .status(500)
        .json({ error: 'Failed to create Stripe Connect account' });
    }
  }

  // Optional: GET current connect status
  static async getConnectStatus(req, res) {
    const user = await db
      .selectFrom('users')
      .select('stripe_connect_id')
      .where('id', '=', req.user.id)
      .executeTakeFirst();

    if (!user?.stripe_connect_id) {
      return res.json({ connected: false });
    }

    const account = await stripe.accounts.retrieve(user.stripe_connect_id);
    res.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  }
}

module.exports = PayoutController;
