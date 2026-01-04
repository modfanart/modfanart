// app/api/stripe/create-checkout/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: 'API is alive' });
}
