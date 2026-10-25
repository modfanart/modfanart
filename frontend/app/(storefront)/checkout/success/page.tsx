'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Thank you for your order
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your order has been placed. You can view status in your account
          orders.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/storefront">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
