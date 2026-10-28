import { redirect } from 'next/navigation';

export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/marketplace/product/${encodeURIComponent(id)}`);
}
