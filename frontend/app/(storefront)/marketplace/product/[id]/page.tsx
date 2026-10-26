'use client';

import { useParams } from 'next/navigation';

import { ProductDetail } from '@/components/marketplace/product-detail';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  return <ProductDetail id={id} />;
}
