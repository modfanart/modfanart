// app/u/[username]/page.tsx
import { ProfileView } from '@/components/profile/profile-view';
import { redirect } from 'next/navigation';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>; // ← note: Promise here
}) {
  // 1. Await the params (required in dynamic routes)
  const { username } = await params;

  // Optional: basic validation / sanitization
  if (!username || typeof username !== 'string' || username.trim() === '') {
    // You could redirect or show 404 page
    return <div className="text-center py-20">Invalid username</div>;
  }

  // 2. Optional: server-side current user check
  // If you have a way to get current user on server (cookies + JWT verify or DB call)
  // const currentUser = await getCurrentUserFromRequest(req); // custom helper
  // const isOwnProfile = currentUser?.username?.toLowerCase() === username.toLowerCase();

  // For now – we pass username to client component → let RTK Query handle the rest
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12 max-w-7xl bg-white min-h-screen">
      <ProfileView targetUsername={username} />
    </div>
  );
}
