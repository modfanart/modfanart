import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <div className="container flex h-[50vh] items-center justify-center px-4 py-8 md:px-6 md:py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
