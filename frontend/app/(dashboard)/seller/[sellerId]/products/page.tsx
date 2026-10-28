import { redirect } from 'next/navigation';

export default async function LegacySellerRoute({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  redirect(`/seller/${encodeURIComponent(sellerId)}/store/products`);
}
