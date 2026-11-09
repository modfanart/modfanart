import { redirect } from 'next/navigation';

export default function LegacyCheckoutSuccessPage() {
  redirect('/marketplace/orders');
}
