import { redirect } from 'next/navigation';

export default function LegacyOrdersPage() {
  redirect('/marketplace/orders');
}
