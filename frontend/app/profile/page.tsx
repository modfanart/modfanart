'use client';

import { ProfileView } from '@/components/profile/profile-view';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12 max-w-7xl bg-white">
      <ProfileView isPublic={false} />
    </div>
  );
}
