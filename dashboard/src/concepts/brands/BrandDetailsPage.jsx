import React from 'react';
import { useParams } from 'react-router-dom';

import {
  Users,
  Image as ImageIcon,
  Trophy,
  ShieldCheck,
  Eye,
  Heart,
  Calendar,
  ArrowUpRight,

  Sparkle,
} from '@phosphor-icons/react';
import { UserRound } from 'lucide-react';
import { Header } from '../../components/layout/Header';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';

import {
  useGetBrandQuery,
  useGetBrandArtworksQuery,
  useGetBrandManagersQuery,
} from '../../services/api/brandApi';

import { useGetContestsQuery } from '../../services/api/contestsApi';

export const BrandDetailsPage = () => {
  const { id } = useParams();

  // ================= BRAND =================

  const {
    data: brandRes,
    isLoading: brandLoading,
  } = useGetBrandQuery(id);

  const brand = brandRes;

  // ================= ARTWORKS =================

  const {
    data: artworksRes,
    isLoading: artworksLoading,
  } = useGetBrandArtworksQuery(id);

  const artworks = artworksRes || [];

  // ================= MANAGERS =================

  const {
    data: managersRes,
    isLoading: managersLoading,
  } = useGetBrandManagersQuery(id);

  const managers = managersRes || [];

  // ================= CONTESTS =================

  const {
    data: contestsRes,
    isLoading: contestsLoading,
  } = useGetContestsQuery({
    brand_id: id,
  });

  const contests = contestsRes?.contests || [];

  // ================= LOADING =================

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Brand" subtitle="Loading brand details..." />

        <div className="mx-auto max-w-7xl space-y-6 p-6">
          <div className="h-56 animate-pulse rounded-2xl border bg-muted/40" />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border bg-muted/40"
              />
            ))}
          </div>

          <div className="h-72 animate-pulse rounded-2xl border bg-muted/40" />
        </div>
      </div>
    );
  }

  // ================= NOT FOUND =================

  if (!brand) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Brand" subtitle="Brand details" />

        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
              <Sparkle size={28} className="text-muted-foreground" />
            </div>

            <h2 className="text-xl font-semibold">
              Brand not found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              The brand you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ================= HELPERS =================

  const brandInitials =
    brand.name
      ?.split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'BR';

  const formatNumber = (value) => {
    if (!value) return '0';

    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        title={brand.name}
        subtitle={`@${brand.slug}`}
      />

      <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">

        {/* =====================================================
            BRAND HERO
        ====================================================== */}

        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="relative h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_40%)]" />
          </div>

          <CardContent className="relative px-5 pb-6 sm:px-8">

            <div className="-mt-12 flex flex-col gap-6 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">

              {/* Brand identity */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <Avatar className="h-24 w-24 rounded-2xl border-4 border-background bg-muted shadow-md sm:h-28 sm:w-28">
                  <AvatarImage
                    src={brand.logo_url}
                    alt={brand.name}
                    className="object-cover"
                  />

                  <AvatarFallback className="rounded-2xl text-2xl font-bold">
                    {brandInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {brand.name}
                    </h1>

                    {brand.verification_request_id && (
                      <Badge
                        variant="secondary"
                        className="gap-1 border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      >
                        <ShieldCheck size={14} weight="fill" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    @{brand.slug}
                  </p>

                  {brand.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {brand.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {brand.status}
                    </Badge>

                    {brand.category && (
                      <Badge variant="outline">
                        {brand.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand actions */}

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <UserRound size={16} />
                  Manage Brand
                </Button>

                <Button size="sm">
                  View Public Profile
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =====================================================
            QUICK STATS
        ====================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Followers
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {formatNumber(brand.followers_count)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users
                  size={20}
                  weight="duotone"
                  className="text-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Profile Views
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {formatNumber(brand.views_count)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Eye
                  size={20}
                  weight="duotone"
                  className="text-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Licensed Artworks
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {artworks.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <ImageIcon
                  size={20}
                  weight="duotone"
                  className="text-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Contests
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {contests.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy
                  size={20}
                  weight="duotone"
                  className="text-amber-500"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="min-w-0 space-y-8">

            {/* ================= CONTESTS ================= */}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                      <Trophy
                        size={17}
                        weight="duotone"
                        className="text-amber-500"
                      />
                    </div>

                    <h2 className="text-lg font-semibold">
                      Contests
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Contests created or sponsored by this brand
                  </p>
                </div>

                <Badge variant="secondary">
                  {contests.length}
                </Badge>
              </div>

              {contestsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-44 animate-pulse rounded-xl border bg-muted/40"
                    />
                  ))}
                </div>
              ) : contests.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Trophy
                        size={22}
                        className="text-muted-foreground"
                      />
                    </div>

                    <p className="font-medium">
                      No contests yet
                    </p>

                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      This brand hasn't participated in or created any contests.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {contests.map((contest) => (
                    <Card
                      key={contest.id}
                      className="group transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <CardContent className="p-5">

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {contest.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {contest.description ||
                                'No description available.'}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <ArrowUpRight size={17} />
                          </Button>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              contest.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {contest.status}
                          </Badge>

                          {contest.visibility && (
                            <Badge
                              variant="outline"
                              className="capitalize"
                            >
                              {contest.visibility}
                            </Badge>
                          )}
                        </div>

                        {(contest.start_date || contest.end_date) && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar size={14} />

                            <span>
                              {formatDate(contest.start_date)}
                              {contest.end_date &&
                                ` — ${formatDate(contest.end_date)}`}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* ================= ARTWORKS ================= */}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <ImageIcon
                        size={17}
                        weight="duotone"
                        className="text-purple-500"
                      />
                    </div>

                    <h2 className="text-lg font-semibold">
                      Licensed Artworks
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Artwork licensed by this brand
                  </p>
                </div>

                <Badge variant="secondary">
                  {artworks.length}
                </Badge>
              </div>

              {artworksLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="aspect-[4/5] animate-pulse rounded-xl border bg-muted/40"
                    />
                  ))}
                </div>
              ) : artworks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <ImageIcon
                        size={22}
                        className="text-muted-foreground"
                      />
                    </div>

                    <p className="font-medium">
                      No licensed artworks
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Licensed artwork will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {artworks.map((artwork) => (
                    <Card
                      key={artwork.id}
                      className="group overflow-hidden border-border/60"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        {artwork.image_url ? (
                          <img
                            src={artwork.image_url}
                            alt={artwork.title || 'Artwork'}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon
                              size={32}
                              className="text-muted-foreground"
                            />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-sm font-medium text-white">
                            {artwork.title}
                          </p>

                          {artwork.creator_name && (
                            <p className="mt-0.5 truncate text-xs text-white/70">
                              {artwork.creator_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-3">
                        <p className="truncate text-sm font-medium">
                          {artwork.title || 'Untitled Artwork'}
                        </p>

                        {artwork.creator_name && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            by {artwork.creator_name}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">

            {/* ================= BRAND OVERVIEW ================= */}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Brand Overview
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Users size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Followers
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Audience
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {formatNumber(brand.followers_count)}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Eye size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Views
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Profile reach
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {formatNumber(brand.views_count)}
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        Artworks
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Licensed assets
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold">
                    {artworks.length}
                  </p>
                </div>

              </CardContent>
            </Card>

            {/* ================= BRAND TEAM ================= */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    Brand Team
                  </CardTitle>

                  <p className="mt-1 text-xs text-muted-foreground">
                    People managing this brand
                  </p>
                </div>

                <Badge variant="secondary">
                  {managers.length}
                </Badge>
              </CardHeader>

              <CardContent>
                {managersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3"
                      >
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />

                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                          <div className="h-2 w-16 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : managers.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users
                        size={18}
                        className="text-muted-foreground"
                      />
                    </div>

                    <p className="text-sm font-medium">
                      No team members
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      No managers are assigned to this brand.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {managers.map((manager) => {
                      const username =
                        manager.user?.username || 'Unknown User';

                      const initials = username
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <div
                          key={manager.id}
                          className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/60"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={manager.user?.avatar_url}
                              alt={username}
                            />

                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {username}
                            </p>

                            <p className="truncate text-xs capitalize text-muted-foreground">
                              {manager.role || 'Manager'}
                            </p>
                          </div>

                          <ShieldCheck
                            size={17}
                            weight="fill"
                            className="shrink-0 text-emerald-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ================= STATUS ================= */}

            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShieldCheck
                      size={18}
                      weight="duotone"
                      className="text-emerald-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Brand Status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      This brand is currently{' '}
                      <span className="font-medium text-foreground">
                        {brand.status}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </aside>
        </div>
      </main>
    </div>
  );
};

export default BrandDetailsPage;

