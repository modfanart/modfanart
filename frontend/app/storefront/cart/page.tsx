'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toaster';

// Sample cart data
const initialCartItems = [
  {
    id: 'cart-item-1',
    productId: 'prod-1',
    title: 'Hulk Nature T-Shirt',
    price: 29.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hulk%20nature-2.jpg-ivaqVZqmxWtiQzqj7KrfCIH3S8XKHP.jpeg',
    quantity: 1,
    size: 'L',
    color: 'Black',
    slug: 'hulk-nature-tshirt',
  },
  {
    id: 'cart-item-2',
    productId: 'prod-2',
    title: 'Ahsoka Tano Poster',
    price: 19.99,
    imageUrl:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ahsoka-FINAL-01%20%282%29-PO2rMTckglJ6t9uWAalnbK7kR10iY9.png',
    quantity: 2,
    size: '18x24',
    color: '',
    slug: 'ahsoka-tano-poster',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<typeof initialCartItems>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading cart data
    const timer = setTimeout(() => {
      setCartItems(initialCartItems);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(
      cartItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 4.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = () => {
    toast({
      title: 'Proceeding to checkout',
      description: 'Redirecting to secure payment page...',
    });
    // In a real app, this would redirect to the checkout page
  };

  if (isLoading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/marketplace">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Items ({cartItems.length})</h2>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                      <Image
                        src={item.imageUrl || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <Link
                            href={`/marketplace/product/${item.slug}`}
                            className="font-medium hover:underline"
                          >
                            {item.title}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.size}
                            {item.color && `, ${item.color}`}
                          </p>
                        </div>
                        <div className="mt-2 font-semibold sm:mt-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <div className="flex h-8 w-12 items-center justify-center border-y text-sm">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/marketplace" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <div className="rounded-lg border">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <Button className="mt-4 w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
