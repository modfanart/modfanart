import { redirect } from 'next/navigation';

// This page used to render hard-coded fake license data to anyone. The real
// confirmation lives at /artwork/<id>/license/success.
export default async function LegacyLicenseSuccess({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/artwork/${encodeURIComponent(id)}/license/success`);
}
