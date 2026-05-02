'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Share2, BookmarkPlus, Eye, Trophy, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { useAuth } from '@/store/AuthContext';
import { useGetContestQuery } from '@/services/api/contestsApi';
import type { Contest } from '@/services/api/contestsApi';

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>();
  const contestId = params.id;
  const { user } = useAuth();
  const role = user?.role?.name;

  let artistBase = '';
  if (role === 'Artist') {
    const username = user?.username?.trim().toLowerCase();
    if (username) artistBase = `/artist/${username}`;
  }

  // ─────────────────────────────────────────────────────────────
  // HOOKS
  // ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetContestQuery(contestId!, {
    skip: !contestId,
  });

  const contest = data ?? null;

  // Safe parsing for gallery and prizes
  const galleryImages: string[] = Array.isArray(contest?.gallery)
    ? contest.gallery
    : typeof contest?.gallery === 'string'
      ? JSON.parse(contest.gallery || '[]')
      : [];

  const prizes = Array.isArray(contest?.prizes)
    ? contest.prizes
    : typeof contest?.prizes === 'string'
      ? JSON.parse(contest.prizes || '[]')
      : [];

  const deadline = contest?.submission_end_date
    ? new Date(contest.submission_end_date)
    : new Date();

  const now = new Date();

  // FIXED: Better isActive logic
  // A contest is active for submissions if status is 'live' or 'published' AND deadline hasn't passed
  const isActive =
    contest && (contest.status === 'live' || contest.status === 'published') && deadline > now;

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    done: !isActive,
  });

  // Countdown Timer
  useEffect(() => {
    if (!isActive || !contest) return;

    const interval = setInterval(() => {
      const diff = deadline.getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00', done: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        done: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, deadline, contest]);

  // Prize formatting (USD only)
  const formatPrizePool = (prizeList: any[] = []) => {
    if (!prizeList.length) return 'TBA';
    const total = prizeList.reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0);
    return total > 0 ? `$${total.toLocaleString('en-US')}` : 'TBA';
  };

  const topPrize = prizes.find((p: any) => p.rank === 1);
  const topPrizeText = topPrize?.amount_usd
    ? `$${Number(topPrize.amount_usd).toLocaleString('en-US')}`
    : 'TBA';

  const storefrontUrl = contest?.brand_id ? `/marketplace/storefront/${contest.brand_id}` : '#';

  // ─────────────────────────────────────────────────────────────
  // LOADING & ERROR STATES
  // ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading contest details…</p>
      </div>
    );
  }

  if (isError || !contest) {
    return (
      <div className="container py-20 text-center min-h-[60vh]">
        <h1 className="text-3xl font-bold tracking-tight">Contest Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          The contest you're looking for doesn't exist, has ended, or was removed.
        </p>
        <Link href="/opportunities" className="mt-8 inline-block">
          <Button>← Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gallery Support */}
      <div className="relative w-full overflow-hidden aspect-[21/7] md:aspect-[21/6]">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          navigation
          className="h-full"
        >
          {/* Hero Image */}
          <SwiperSlide>
            <img
              loading="lazy"
              alt={contest.title}
              src={
                contest.hero_image ||
                'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'
              }
              className="w-full h-full object-cover"
            />
          </SwiperSlide>

          {/* Gallery Images */}
          {galleryImages.length > 0 &&
            galleryImages.map((url: string, index: number) => (
              <SwiperSlide key={index}>
                <img
                  loading="lazy"
                  alt={`Gallery ${index + 1}`}
                  src={url}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{contest.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <Link
                href={storefrontUrl}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden border bg-muted">
                  <Image
                    src={contest.brand_logo || '/placeholder.svg?height=32&width=32'}
                    alt={contest.brand_name || 'Organizer'}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{contest.brand_name || 'Organizer'}</span>
              </Link>

              <Badge variant={isActive ? 'secondary' : 'destructive'} className="text-sm">
                {isActive ? 'Active' : 'Closed'}
              </Badge>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{contest.view_count ?? '—'} views</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Highlight Box */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <CardContent className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-4">
              Your Chance to Create Official Merch!
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Submit your best original artwork for this contest — selected designs may be licensed,
              produced as merchandise, and sold worldwide.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-black text-primary">{prizes.length || '?'}</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Winners Selected
                </p>
              </div>
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-black text-primary">{formatPrizePool(prizes)}</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Prize Pool (USD)
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="font-semibold uppercase tracking-wide mb-3">What You Can Win</p>
                <ul className="space-y-2 text-sm">
                  <li>• Cash prizes (up to {topPrizeText})</li>
                  <li>• Official licensing opportunity</li>
                  <li>• Merch production & exposure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              Contest Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((url: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-xl overflow-hidden border"
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Overview */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold">Contest Overview</h3>
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: contest.description || '' }}
            />
            {(!contest.description || contest.description.trim() === '') && (
              <p className="text-muted-foreground italic">Detailed description coming soon.</p>
            )}
          </div>

          {/* Prizes Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" /> Prizes
            </h3>
            {prizes.length > 0 ? (
              <div className="space-y-4">
                {[...prizes]
                  .sort((a: any, b: any) => a.rank - b.rank)
                  .map((prize: any) => (
                    <div
                      key={prize.rank}
                      className="flex items-center justify-between rounded-lg border p-6 bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                          {prize.rank}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {prize.rank === 1
                              ? 'Grand Prize'
                              : `${prize.rank}${['st', 'nd', 'rd'][prize.rank - 2] || 'th'} Place`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {prize.description || prize.type}
                          </p>
                        </div>
                      </div>

                      {prize.amount_usd && (
                        <p className="text-3xl font-bold text-green-600">
                          ${Number(prize.amount_usd).toLocaleString('en-US')}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Prize details will be announced soon.</p>
            )}
          </div>

          {/* Rules */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Contest Rules</h3>
            <div className="prose max-w-none dark:prose-invert">
              {contest.rules ? (
                <div dangerouslySetInnerHTML={{ __html: contest.rules }} />
              ) : (
                <ul className="space-y-3 list-disc pl-5">
                  <li>Artwork must be 100% original — no AI, tracing, or copied content</li>
                  <li>Maximum {contest.max_entries_per_user ?? '—'} entries per participant</li>
                  <li>No NSFW, violent, hateful, or brand-damaging content</li>
                  <li>
                    Submissions close on{' '}
                    {deadline.toLocaleDateString('en-US', { dateStyle: 'long' })}
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Timeline</h3>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex justify-between">
                    <span className="font-medium">Submissions Open</span>
                    <span>Now</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Submission Deadline</span>
                    <span>{deadline.toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Winners Announced</span>
                    <span>Shortly after deadline</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Submission Deadline</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Entries close on{' '}
            <strong>{deadline.toLocaleDateString('en-US', { dateStyle: 'long' })}</strong>
          </p>

          {!timeLeft.done ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
              {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                <div
                  key={unit}
                  className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border"
                >
                  <div className="text-4xl md:text-5xl font-black">
                    {timeLeft[unit as keyof typeof timeLeft]}
                  </div>
                  <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xl font-semibold text-destructive">Submissions are now closed.</p>
          )}
        </div>

        {/* Submit CTA - Now correctly respects isActive */}
        <Card className="mt-16 border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-10 md:p-16 text-center">
            {isActive ? (
              <Button asChild size="lg" className="w-full max-w-md h-14 text-lg">
                <Link href={`${artistBase}/my-artworks/new?contest=${contest.id}`}>
                  Submit Your Artwork
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button disabled size="lg" className="w-full max-w-md h-14 text-lg">
                Submissions Closed
              </Button>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              {isActive
                ? 'You must be logged in as an Artist to submit'
                : 'The submission period has ended.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
