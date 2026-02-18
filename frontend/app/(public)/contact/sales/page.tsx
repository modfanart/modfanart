import type { Metadata } from 'next';
import { ContactSalesPage } from './contact-sales-page';

export const metadata: Metadata = {
  title: 'Contact Sales | MOD Platform',
  description:
    'Get in touch with our sales team to learn more about MOD Platform and schedule a demo.',
};

export default function ContactSales() {
  return <ContactSalesPage />;
}
