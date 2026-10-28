import { redirect } from 'next/navigation';

// The legacy checkout created unpaid orders without a shipping address.
// All checkout now goes through the marketplace flow.
export default function LegacyCheckoutPage() {
  redirect('/marketplace/checkout');
}
