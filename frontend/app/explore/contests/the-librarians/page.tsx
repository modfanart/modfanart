'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Share2, BookmarkPlus, Eye } from 'lucide-react';
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
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Mock data (in real app → fetch from API / props)
const getOpportunityById = (id: string) => {
  const contests = [
    {
      id: 'the-librarians',
      title: 'The Librarians Official Fan Art Contest',
      description:
        'Create original fan art inspired by The Librarians universe — past, present, or future.',
      image: 'https://i.postimg.cc/G3YDbny2/New-Images-Artboard-5.png',
      organizer: 'Electric Entertainment, Inc',
      organizerLogo:
        'https://www.thefilmcatalogue.com/assets/company-logos/4374/EE-KITE-VERTICAL-BLUE-REVISED_190628_002458.jpg',
      deadline: '2026-03-01',
      prize: '$100 + royalties',
      entries: 156,
      status: 'active',
      categories: ['Fan Art'],
      featured: true,
      type: 'contest',
    },
  ];

  return contests.find((contest) => contest.id === id);
};

export default function OpportunityDetailPage() {
  const opportunity = getOpportunityById('the-librarians');

  if (!opportunity) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Opportunity not found</h1>
        <p className="mt-4">
          The opportunity you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/opportunities" className="mt-6 inline-block">
          <Button>Back to Opportunities</Button>
        </Link>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<
    'overview' | 'how' | 'prizes' | 'timeline' | 'rules' | 'specs' | 'legal'
  >('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'how', label: 'How It Works' },
    { id: 'prizes', label: 'Prizes' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'rules', label: 'Rules' },
    { id: 'specs', label: 'Submission Specs' },
    { id: 'legal', label: 'Legal' },
  ];

  const deadline = new Date('2026-03-01T00:00:00Z');
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    done: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

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
  }, []);

  const isClosed = timeLeft.done;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel */}
      <div className="relative w-full overflow-hidden aspect-[21/7] md:aspect-[21/6]">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          navigation
          className="h-full"
        >
          <SwiperSlide>
            <img
              loading="lazy"
              alt="The Librarians cast imagery"
              src="https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/0726e6f8-83fd-4ac1-a87c-7a6e33df0bc3/24946_001_0507_R.jpg"
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              loading="lazy"
              alt="The Librarians character scene"
              src="https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6536a179-534f-4db7-91d4-db63af09f619/1549733_LIB4306_R.jpg"
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        </Swiper>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{opportunity.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                  <Image
                    src={opportunity.organizerLogo || '/placeholder.svg'}
                    alt={opportunity.organizer}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{opportunity.organizer}</span>
              </div>
              <Badge variant={isClosed ? 'destructive' : 'secondary'} className="text-sm">
                {isClosed ? 'Closed' : 'Active'}
              </Badge>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>1,245 views</span>
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
              Bring Your Creativity Into The World of The Librarians!
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              For the first time ever, fan artists are invited to submit original artwork inspired
              by <strong>The Librarians</strong> universe — with the opportunity to have your work{' '}
              <strong>officially licensed</strong>, turned into real merchandise, and sold
              worldwide.
            </p>
            <p className="text-xl font-semibold mb-8">
              This is your chance to move from fan art to canon.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-black text-primary">10</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Artists Selected
                </p>
              </div>
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-black text-primary">$100 USD</div>
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Cash Prize
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="font-semibold uppercase tracking-wide mb-3">What You Get</p>
                <ul className="space-y-2 text-sm">
                  <li>• Ongoing royalties from merch sales</li>
                  <li>• Officially licensed artwork</li>
                  <li>• Recognition in the Official Librarians Fan Merch Collection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to Submit */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">WHAT TO SUBMIT</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            We’re looking for original fan art inspired by <strong>The Librarians</strong> universe
            — past, present, or future.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Draw Inspiration From</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Characters</li>
                  <li>Magical artifacts</li>
                  <li>The Library</li>
                  <li>Iconic moments and lore</li>
                  <li>Symbols, themes, or quotes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Styles Welcome</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Illustration</li>
                  <li>Graphic Design</li>
                  <li>Typography</li>
                  <li>Poster style art</li>
                  <li>Modern or nostalgic</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-center gap-2 bg-muted/40 p-3 rounded-2xl border">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium',
                  activeTab === tab.id && 'shadow-sm'
                )}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-12">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold">Quick Reference</h3>
                <p className="text-lg text-muted-foreground">
                  We are selecting <strong>10 winning artworks</strong> to become part of the{' '}
                  <strong>Official Librarians Fan Merch Collection</strong>. Each winner receives{' '}
                  <strong>$100</strong> plus <strong>5% royalties</strong> from every sale of their
                  design.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-green-50/50 border-green-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-sm mb-4">
                      ALLOWED
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>Original fan art in your own style</li>
                      <li>Recognizable Librarians inspired elements</li>
                      <li>Respectful, on-brand interpretations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-red-50/50 border-red-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 text-red-800 font-bold text-sm mb-4">
                      NOT ALLOWED
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>AI generated art</li>
                      <li>Copied official key art</li>
                      <li>Other franchises or copyrighted IP</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50/50 border-amber-200">
                  <CardContent className="p-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-4">
                      CHECK FIRST
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>Explicit content</li>
                      <li>Hate, harassment, or harmful depictions</li>
                      <li>Anything that could damage the brand</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* How It Works */}
          {activeTab === 'how' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">How It Works</h3>
              <p className="text-muted-foreground">
                Five steps from your artwork to official merch.
              </p>

              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    value: '1',
                    title: 'Submit your artwork',
                    content: 'Upload your original fan art inspired by The Librarians.',
                  },
                  {
                    value: '2',
                    title: 'Review and selection',
                    content:
                      'Submissions are reviewed for creativity, quality, and fit with the franchise.',
                  },
                  {
                    value: '3',
                    title: 'Winners announced',
                    content: '10 artists are selected and contacted with next steps.',
                  },
                  {
                    value: '4',
                    title: 'Licensing and production',
                    content: 'Winning designs are officially licensed and produced as merch.',
                  },
                  {
                    value: '5',
                    title: 'Get paid',
                    content:
                      'Each winner receives $100 cash plus 5% royalties from every sale of their design.',
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
          )}

          {/* Prizes */}
          {activeTab === 'prizes' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Prizes and Compensation</h3>
              <p className="text-muted-foreground">Clear, simple, and paid.</p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-8">
                    <h4 className="text-xl font-bold mb-4">Winners</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li>• 10 selected submissions</li>
                      <li>• Officially licensed artwork</li>
                      <li>• Global distribution via the official collection</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-8">
                    <h4 className="text-xl font-bold mb-4">Payout</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li>• $100 guaranteed per winner</li>
                      <li>• 5% royalties from every sale of their design</li>
                      <li>• Official credit as a licensed fan artist</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Timeline</h3>
              <p className="text-muted-foreground">Key dates for this contest.</p>

              <Accordion type="single" collapsible defaultValue="dates" className="w-full">
                <AccordionItem value="dates">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl">
                        📅
                      </span>
                      <span className="font-semibold text-lg">Dates</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-14">
                    <ul className="space-y-3 text-muted-foreground">
                      <li>
                        <strong>Submissions open:</strong> Now
                      </li>
                      <li>
                        <strong>Submission deadline:</strong> March 1st, 2026
                      </li>
                      <li>
                        <strong>Winners announced:</strong> March 5th, 2026
                      </li>
                      <li>
                        <strong>Merch launch:</strong> Shortly after selection
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Contest Rules</h3>
              <p className="text-muted-foreground">
                Summary rules to keep everything clean, fair, and licensable.
              </p>

              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    value: 'true',
                    icon: '✅',
                    title: 'Must be true',
                    content: (
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Submissions must be original artwork</li>
                        <li>Artwork must be inspired by The Librarians IP</li>
                        <li>Keep it printable and merch friendly</li>
                      </ul>
                    ),
                  },
                  {
                    value: 'not-allowed',
                    icon: '⛔',
                    title: 'Not allowed',
                    content: (
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>No AI generated art</li>
                        <li>No copyrighted material from other franchises</li>
                        <li>No copied official key art</li>
                        <li>No explicit, hateful, or harmful content</li>
                      </ul>
                    ),
                  },
                  {
                    value: 'want',
                    icon: '🎯',
                    title: 'What we want you to make',
                    content: (
                      <>
                        <p className="text-muted-foreground mb-4">
                          Create artwork that feels authentically Librarians.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                          <li>Illustration, graphic design, typography, poster style</li>
                          <li>Modern or nostalgic</li>
                          <li>Recognizable elements fans instantly know</li>
                        </ul>
                      </>
                    ),
                  },
                  {
                    value: 'age',
                    icon: '👤',
                    title: 'Age and consent',
                    content: (
                      <p className="text-muted-foreground">
                        The contest is open to individuals of all ages. Participants under 18 must
                        have parent or guardian consent and may be asked to confirm.
                      </p>
                    ),
                  },
                ].map((item) => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl">
                          {item.icon}
                        </span>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-14">{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Specs */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Submission Specs</h3>
              <p className="text-muted-foreground">Make it easy to review and easy to print.</p>

              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    value: 'format',
                    icon: '🖼️',
                    title: 'File format and quality',
                    content: (
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>Accepted formats: JPG, PNG, or PDF</li>
                        <li>Minimum 300 DPI recommended</li>
                        <li>
                          Upload clear, high quality images (minimum 1200px on the longest side)
                        </li>
                      </ul>
                    ),
                  },
                  {
                    value: 'print',
                    icon: '👕',
                    title: 'Print size guidance',
                    content: (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Design with apparel printing in mind. A common DTG maximum print area is
                          about <strong>12 by 16 inches</strong>. If you work in pixels, a safe
                          target is about <strong>3600 by 4800 px</strong>.
                        </p>
                        {/* You can add the image here if you want */}
                        {/* <img src="..." alt="Print size guide" className="rounded-lg border" /> */}
                      </div>
                    ),
                  },
                  {
                    value: 'desc',
                    icon: '✍️',
                    title: 'Description',
                    content: (
                      <p className="text-muted-foreground">
                        Include a short description of your artwork and what it references in The
                        Librarians universe. Keep it simple and specific.
                      </p>
                    ),
                  },
                ].map((item) => (
                  <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl">
                          {item.icon}
                        </span>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-14">{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Legal */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Legal</h3>
              <p className="text-muted-foreground">
                Key points. Full terms are available at the link below.
              </p>

              <Card className="bg-muted/40">
                <CardContent className="p-8">
                  <ul className="space-y-4 text-muted-foreground">
                    <li>
                      <strong>Original work:</strong> You confirm your submission is your original
                      creation and does not infringe third party rights.
                    </li>
                    <li>
                      <strong>Permitted fan work:</strong> You may include elements from The
                      Librarians IP for this contest. Any other third party content requires
                      permission.
                    </li>
                    <li>
                      <strong>Limited promo license:</strong> By submitting, you allow MOD to host
                      and display your submission to run and promote the contest while you retain
                      ownership.
                    </li>
                    <li>
                      <strong>Winner agreement:</strong> If selected, you will be asked to sign a
                      separate licensing agreement covering commercial use and royalties.
                    </li>
                    <li>
                      <strong>Removal and disqualification:</strong> Submissions may be removed or
                      disqualified if they violate rules or upon IP owner request.
                    </li>
                    <li>
                      <strong>Privacy:</strong> Your contact info is used to administer the contest
                      and communicate about prizes and royalties.
                    </li>
                  </ul>

                  <div className="mt-8">
                    <Button asChild size="lg">
                      <a
                        href="resources/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Legal Terms and Conditions
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Submission Deadline</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Entries close on <strong>March 1, 2026</strong>. Get your design in before time runs
            out.
          </p>

          {!timeLeft.done ? (
            <div
              aria-live="polite"
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto"
            >
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
            {isClosed ? (
              <Button disabled size="lg" className="w-full max-w-md h-14 text-lg">
                Submissions Closed
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full max-w-md h-14 text-lg">
                <Link href={`/submissions/new?opportunity=${opportunity.id}`}>
                  Submit Your Artwork
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              {isClosed
                ? 'The submission period has ended.'
                : 'Submission will open in your dashboard'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
