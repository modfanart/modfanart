"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toaster"

// Sample cart data for checkout
const cartItems = [
  {
    id: "cart-item-1",
    title: "Hulk Nature T-Shirt",
    price: 29.99,
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg",
    quantity: 1,
    size: "L",
    color: "Black",
  },
  {
    id: "cart-item-2",
    title: "Ahsoka Tano Poster",
    price: 19.99,
    imageUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png",
    quantity: 2,
    size: "18x24",
    color: "",
  },
]

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal >= 50 ? 0 : 4.99
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // In a real app, this would call the Stripe API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      window.location.href = "/marketplace/checkout/success"
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/marketplace/cart" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Complete your purchase</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Information */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" required className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input id="postal-code" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Credit / Debit Card
                    </div>
                  </Label>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="ml-6 space-y-4 rounded-lg border p-4">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" required className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name-on-card">Name on Card</Label>
                      <Input id="name-on-card" required className="mt-1" />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                    <div className="flex items-center">
                      <Image
                        src="/placeholder.svg?height=20&width=80"
                        alt="PayPal"
                        width={80}
                        height={20}
                        className="mr-2"
                      />
                      PayPal
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-6 flex items-center space-x-2">
                <Checkbox id="save-payment" />
                <Label htmlFor="save-payment">Save payment information for future purchases</Label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Secure checkout powered by Stripe
              </div>
              <Button type="submit" size="lg" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Pay $${calculateTotal().toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <div className="rounded-lg border">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                      <Image src={item.imageUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size}
                        {item.color && `, ${item.color}`} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{calculateShipping() === 0 ? "Free" : `$${calculateShipping().toFixed(2)}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

