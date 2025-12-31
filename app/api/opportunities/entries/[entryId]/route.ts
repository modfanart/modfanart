export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ entryId: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { entryId } = await params;
    const body = await request.json();

    // In a real implementation, update the entry in the database
    console.log(`Updating entry ${entryId}:`, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { entryId } = await params;

    // In a real implementation, delete the entry from the database
    console.log(`Deleting entry ${entryId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
