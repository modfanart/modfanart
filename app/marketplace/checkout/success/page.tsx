import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  return (
    <div className="container flex flex-col items-center justify-center px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Order Confirmed!</h1>
        <p className="mb-8 text-muted-foreground">
          Thank you for your purchase. Your order has been confirmed and will be shipped soon.
        </p>

        <div className="mb-8 rounded-lg border p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-medium">MOD-12345</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">$69.97</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-medium">Credit Card</span>
            </div>
          </div>
        </div>

        <p className="mb-4 text-muted-foreground">
          We've sent a confirmation email with all the details of your order.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/marketplace">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">View Order History</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

