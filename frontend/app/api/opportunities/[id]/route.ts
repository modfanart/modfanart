export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextResponse } from 'next/server';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  status: string;
  deadline: string;
  reward: string;
  requirements: string;
  createdAt: string;
  updatedAt: string;
};

// Mock data - replace with actual database queries
const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-123',
    title: 'Star Wars Fan Art Collection',
    description:
      'Create fan art for the upcoming Star Wars series. Selected artwork will be featured in official promotional materials.',
    brand: 'Lucasfilm',
    category: 'Fan Art',
    status: 'active',
    deadline: '2025-05-04T23:59:59Z',
    reward: '$500 per selected artwork',
    requirements: 'Digital artwork only, must be original, must follow brand guidelines',
    createdAt: '2024-02-15T12:00:00Z',
    updatedAt: '2024-02-15T12:00:00Z',
  },
  {
    id: 'opp-456',
    title: 'Marvel Superhero Reimagined',
    description:
      'Create your own interpretation of Marvel superheroes. Winners will be featured in a digital gallery.',
    brand: 'Marvel',
    category: 'Character Design',
    status: 'active',
    deadline: '2025-06-15T23:59:59Z',
    reward: 'Featured in digital gallery and $300 prize',
    requirements: 'Any medium accepted, must be original work',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const opportunity = mockOpportunities.find((opp) => opp.id === id);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log(`Updating opportunity ${id}:`, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    console.log(`Deleting opportunity ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
