'use client';

import { useMemo, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  getApiErrorMessage,
  useConfirmOrderPaymentMutation,
  useCreateOrderPaymentMutation,
} from '@/services/api/marketplaceApi';

const publishableKey = process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface PaymentFormProps {
  /** Orders to pay for. Omit when `prepare` creates them on demand. */
  orderIds?: string[];
  /**
   * Called once, on the first click, to create the pending orders (cart
   * checkout). The ids are remembered, so a declined card can be retried
   * against the same orders instead of creating new ones.
   */
  prepare?: () => Promise<string[]>;
  disabled?: boolean;
  /** Label for the pay button, e.g. "Pay $12.99". */
  label: string;
  onPaid: (orderIds: string[]) => void;
}

function Inner({ orderIds, prepare, disabled, label, onPaid }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const idsRef = useRef<string[] | null>(orderIds ?? null);

  const [createPayment] = useCreateOrderPaymentMutation();
  const [confirmPayment] = useConfirmOrderPaymentMutation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setBusy(true);
    setError(null);

    try {
      if (!idsRef.current) {
        idsRef.current = prepare ? await prepare() : [];
      }
      const ids = idsRef.current;

      if (!ids.length) throw new Error('No orders to pay for');

      const session = await createPayment({ order_ids: ids }).unwrap();

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        session.clientSecret,
        { payment_method: { card } }
      );

      if (stripeError) {
        setError(stripeError.message || 'Your card was declined. Please try another card.');
        return;
      }

      if (paymentIntent && ['succeeded', 'processing'].includes(paymentIntent.status)) {
        // The Stripe webhook is the source of truth; this just makes the
        // result visible immediately. A failure here must not look like a
        // failed payment, so it is swallowed.
        try {
          await confirmPayment({ payment_intent_id: paymentIntent.id }).unwrap();
        } catch {
          /* webhook will reconcile */
        }
        onPaid(ids);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Payment could not be completed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3">
        <CardElement
          options={{
            hidePostalCode: true,
            style: { base: { fontSize: '16px' } },
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button size="lg" className="w-full" disabled={disabled || busy || !stripe} onClick={pay}>
        <Lock className="mr-2 h-4 w-4" />
        {busy ? 'Processing…' : label}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment powered by Stripe. We never see your card details.
      </p>
    </div>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  const options = useMemo(() => ({}), []);

  if (!stripePromise) {
    return (
      <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        Payments are not configured (missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <Inner {...props} />
    </Elements>
  );
}
