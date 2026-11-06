import { redirect } from 'next/navigation';

// The legacy cart lived here. The marketplace cart is the single flow now.
export default function LegacyCartPage() {
  redirect('/marketplace/cart');
}
