// app/user/[userId]/stats/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Shield,
  Award,
  Image,
  Heart,
  Eye,
} from 'lucide-react';

import { useGetUserByIdQuery } from '@/services/api/userApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserStatsPage() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user, isLoading } = useGetUserByIdQuery(userId);

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-10 overflow-hidden">
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-primary/5" />

          <CardContent className="relative px-6 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} />
                <AvatarFallback className="text-4xl bg-primary/10">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">{user.username}</h1>

                  <Badge variant="outline" className="text-base px-4 py-1">
                    {user.status}
                  </Badge>

                  {user.role && (
                    <Badge variant="secondary" className="text-base px-4 py-1">
                      {user.role.name}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Joined{' '}
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {user.bio && <p className="text-muted-foreground mt-3 max-w-2xl">{user.bio}</p>}

                {(user.website || Object.keys(user.profile || {}).length > 0) && (
                  <div className="flex flex-wrap gap-4 mt-3">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Website
                      </a>
                    )}

                    {user.profile?.twitter && (
                      <a
                        href={`https://twitter.com/${user.profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Image className="h-6 w-6" />}
            title="Artworks Uploaded"
            value={user.stats?.artworks_count ?? 0}
            description="Total uploads"
          />

          <StatCard
            icon={<Heart className="h-6 w-6" />}
            title="Likes Received"
            value={user.stats?.likes_received ?? 0}
            description="Community engagement"
          />

          <StatCard
            icon={<Eye className="h-6 w-6" />}
            title="Total Views"
            value={user.stats?.views_received ?? 0}
            description="Across all artworks"
          />

          <StatCard
            icon={<User className="h-6 w-6" />}
            title="Followers"
            value={user.stats?.followers_count ?? 0}
            description="People following this user"
          />

          <StatCard
            icon={<User className="h-6 w-6" />}
            title="Following"
            value={user.stats?.following_count ?? 0}
            description="Accounts followed"
          />

          <StatCard
            icon={<Shield className="h-6 w-6" />}
            title="Violations"
            value="0 active"
            description="Moderation status"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------ Stat Card ------------------ */

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary/70">{icon}</div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
