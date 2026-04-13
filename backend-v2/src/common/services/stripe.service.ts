import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Create Payment Intent (used in your order creation)
   */
  async createPaymentIntent(params: {
    amount: number; // in smallest currency unit (e.g. paise)
    currency?: string;
    metadata?: Record<string, string>;
    customerId?: string;
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || 'inr',
        metadata: params.metadata,
        customer: params.customerId,
        automatic_payment_methods: { enabled: true },
      });

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Retrieve Payment Intent (used in confirmOrder)
   */
  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new BadRequestException('Invalid payment intent');
    }
  }

  /**
   * Confirm payment status
   */
  async isPaymentSuccessful(paymentIntentId: string) {
    const intent = await this.retrievePaymentIntent(paymentIntentId);

    return intent.status === 'succeeded';
  }

  /**
   * Create connected account (for seller payouts)
   */
  async createConnectedAccount(email: string) {
    return this.stripe.accounts.create({
      type: 'express',
      email,
    });
  }

  /**
   * Create account onboarding link
   */
  async createAccountLink(accountId: string) {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/reauth`,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
      type: 'account_onboarding',
    });
  }

  /**
   * Transfer payout to seller (after order confirmation)
   */
  async transferToSeller(params: {
    amount: number;
    destinationAccountId: string;
    metadata?: Record<string, string>;
  }) {
    try {
      return await this.stripe.transfers.create({
        amount: params.amount,
        currency: 'inr',
        destination: params.destinationAccountId,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Optional: Refund
   */
  async refundPayment(paymentIntentId: string, amount?: number) {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
