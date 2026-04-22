'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Share2, BookmarkPlus, Eye, Trophy, Calendar, Users } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import { useGetContestQuery } from '@/services/api/contestsApi';
import type { Contest } from '@/services/api/contestsApi';
import type { ContestDetail } from '@/services/api/contestsApi';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';

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
  // ALL HOOKS MUST BE CALLED HERE – BEFORE ANY RETURN
  // ─────────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useGetContestQuery(contestId!, {
    skip: !contestId,
  });

  const contest = data ?? null;
  // Prize helpers – safe now
  const prizes = contest?.prizes ?? [];
  const deadline = contest?.submission_end_date
    ? new Date(contest.submission_end_date)
    : new Date();

  const now = new Date();
  const isActive = contest ? contest.status === 'live' && deadline > now : false;

  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    done: boolean;
  }>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    done: !isActive,
  });

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

  // Prize formatting helpers (safe to define unconditionally)
  // Replace the current formatPrize with this version:
  const formatPrize = (prizesInput: ContestDetail['prizes'] = []) => {
    // Normalize null/undefined → empty array
    const prizes = prizesInput ?? [];

    if (!prizes.length) return 'TBA';

    const total = prizes.reduce((sum, p) => sum + (Number(p.amount_inr) || 0), 0);
    return total > 0 ? `₹${(total / 100).toLocaleString('en-IN')}` : 'TBA';
  };

  const topPrize = prizes.find((p) => p.rank === 1);
  const topPrizeText = topPrize?.amount_inr
    ? `₹${(Number(topPrize.amount_inr) / 100).toLocaleString('en-IN')}`
    : formatPrize();
  const storefrontUrl = contest?.brand_id ? `/marketplace/storefront/${contest.brand_id}` : '#';

  // ─────────────────────────────────────────────────────────────
  // EARLY RETURNS COME ONLY AFTER ALL HOOKS
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
  // HAPPY PATH – FULL RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-background">
        {/* Hero Carousel */}
        <div className="relative w-full overflow-hidden aspect-[21/7] md:aspect-[21/6]">
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            navigation
            className="h-full"
          >
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
            {/* Add more <SwiperSlide> if contest has gallery array */}
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
                Submit your best original artwork for this contest — selected designs may be
                licensed, produced as merchandise, and sold worldwide.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary/10 rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-primary">
                    {contest.prizes?.length || '?'}
                  </div>
                  <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Winners Selected
                  </p>
                </div>
                <div className="bg-primary/10 rounded-xl p-6 text-center">
                  <div className="text-4xl font-black text-primary">
                    {formatPrize(contest?.prizes)}
                  </div>
                  <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                    Prize Pool
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

          {/* Tabs Navigation (pill style – currently static; add state if needed) */}
          <div className="mb-10">
            <div className="flex flex-wrap justify-center gap-2 bg-muted/40 p-3 rounded-2xl border">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'how', label: 'How It Works' },
                { id: 'prizes', label: 'Prizes' },
                { id: 'rules', label: 'Rules' },
                { id: 'timeline', label: 'Timeline' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  className={cn('rounded-full px-5 py-2 text-sm font-medium')}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

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

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-green-50/50 border-green-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-sm mb-4">
                      ALLOWED
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>100% original artwork</li>
                      <li>Theme-relevant creative interpretations</li>
                      <li>Print-friendly designs</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-red-50/50 border-red-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-800 font-bold text-sm mb-4">
                      NOT ALLOWED
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>AI-generated content</li>
                      <li>Traced / copied official artwork</li>
                      <li>NSFW, hateful or harmful content</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-4">
                      REMEMBER
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>Max {contest.max_entries_per_user ?? '—'} entries per person</li>
                      <li>Follow brand guidelines (if provided)</li>
                      <li>Be respectful of IP</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">How It Works</h3>
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    value: '1',
                    title: 'Submit your entry',
                    content: 'Upload your original artwork via the submission form.',
                  },
                  {
                    value: '2',
                    title: 'Judging & Selection',
                    content:
                      'Our team reviews entries based on creativity, quality, and theme fit.',
                  },
                  {
                    value: '3',
                    title: 'Winners Announced',
                    content: `Announced on or shortly after ${deadline.toLocaleDateString('en-IN')}.`,
                  },
                  {
                    value: '4',
                    title: 'Licensing & Production',
                    content:
                      'Selected designs may be licensed and turned into official merchandise.',
                  },
                  {
                    value: '5',
                    title: 'Get Paid',
                    content: 'Winners receive cash prizes + potential royalties / credit.',
                  },
                ].map((step) => (
                  <AccordionItem key={step.value} value={step.value}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                          {step.value}
                        </span>
                        <span className="font-semibold">{step.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-14">
                      {step.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Prizes */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Prizes</h3>
              {contest.prizes?.length ? (
                <div className="space-y-4">
                  {[...contest.prizes]
                    .sort((a, b) => a.rank - b.rank)
                    .map((prize) => (
                      <div
                        key={prize.rank}
                        className="flex items-center justify-between rounded-lg border p-5 bg-card"
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
                            <p className="text-sm text-muted-foreground">{prize.type || 'Cash'}</p>
                          </div>
                        </div>
                        {prize.amount_inr && (
                          <p className="text-2xl font-bold text-green-600">
                            ₹{(Number(prize.amount_inr) / 100).toLocaleString('en-IN')}
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
                      {deadline.toLocaleDateString('en-IN', { dateStyle: 'long' })}
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
                      <span>{deadline.toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
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
              <strong>{deadline.toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong>
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

          {/* Submit CTA */}
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
                {isActive ? 'You must be logged in to submit' : 'The submission period has ended.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}
