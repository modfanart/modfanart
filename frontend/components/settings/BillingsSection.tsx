// components/settings/BillingSection.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BillingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>Manage your plan, payment methods, and view invoices.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        <div className="space-y-4">
          <h4 className="font-medium">Current Plan</h4>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">Pro Plan</p>
                <Badge variant="secondary">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">$29 / month • Billed monthly</p>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Payment Method</h4>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs font-medium">
                VISA
              </div>
              <div>
                <p>•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Billing History</h4>
          <p className="text-sm text-muted-foreground italic">
            No invoices yet. Your first invoice will appear after your trial or first payment.
          </p>
          {/* Later: table with date, amount, status, PDF link */}
        </div>
      </CardContent>
    </Card>
  );
}
