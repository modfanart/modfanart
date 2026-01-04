import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/db/models/user';
import { ProfileView } from '@/components/profile/profile-view';

interface ArtistProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ArtistProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  const user = await getUserById(id);

  if (!user) {
    return {
      title: 'Artist Not Found',
      description: 'The requested artist profile could not be found.',
    };
  }

  return {
    title: `${user.name} | MOD Platform`,
    description: user.bio || `View ${user.name}'s profile and artwork on MOD Platform`,
  };
}

export default async function ArtistProfilePage({ params }: ArtistProfilePageProps) {
  const { id } = await params;

  const user = await getUserById(id);

  if (!user || user.role !== 'artist') {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileView user={user} isPublic={true} />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Artwork</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">No artwork yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
