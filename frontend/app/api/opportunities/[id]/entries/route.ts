export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextResponse } from 'next/server';

type Entry = {
  id: string;
  title: string;
  artist: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt: string;
  imageUrl: string;
};

const mockEntriesByOpportunity: Record<string, Entry[]> = {
  'opp-123': [
    {
      id: 'entry-1',
      title: 'Darth Vader Reimagined',
      artist: 'Jane Smith',
      status: 'approved',
      submittedAt: '2024-02-20T14:30:00Z',
      imageUrl: '/placeholder.svg?height=300&width=300',
    },
    {
      id: 'entry-2',
      title: 'Luke Skywalker Portrait',
      artist: 'John Doe',
      status: 'pending',
      submittedAt: '2024-02-21T09:15:00Z',
      imageUrl: '/placeholder.svg?height=300&width=300',
    },
    {
      id: 'entry-3',
      title: 'Millennium Falcon in Hyperspace',
      artist: 'Alex Johnson',
      status: 'rejected',
      submittedAt: '2024-02-19T16:45:00Z',
      imageUrl: '/placeholder.svg?height=300&width=300',
    },
  ],
  'opp-456': [
    {
      id: 'entry-4',
      title: 'Spider-Man Neo',
      artist: 'Michael Brown',
      status: 'pending',
      submittedAt: '2024-03-05T11:20:00Z',
      imageUrl: '/placeholder.svg?height=300&width=300',
    },
    {
      id: 'entry-5',
      title: 'Iron Man Steampunk',
      artist: 'Sarah Wilson',
      status: 'approved',
      submittedAt: '2024-03-04T16:30:00Z',
      imageUrl: '/placeholder.svg?height=300&width=300',
    },
  ],
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const entries = mockEntriesByOpportunity[id] || [];
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log(`Adding entry to opportunity ${id}:`, body);

    return NextResponse.json({
      success: true,
      id: `entry-${Date.now()}`,
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 });
  }
}
