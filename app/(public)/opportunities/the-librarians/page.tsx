"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Share2, BookmarkPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import { useEffect, useState } from 'react';

// This would normally come from a database
const getOpportunityById = (id: string) => {
  const contests = [
    {
      id: 'the-librarians',
      title: 'The Librarians Official Fan art Contest',
      description: 'Create original fan art inspired by The Librarians universe — past, present, or future.',
      image: 'https://i.postimg.cc/G3YDbny2/New-Images-Artboard-5.png',
      organizer: 'Electric Entertainment, Inc',
      organizerLogo:
        'https://www.thefilmcatalogue.com/assets/company-logos/4374/EE-KITE-VERTICAL-BLUE-REVISED_190628_002458.jpg',
      deadline: '2026-02-29',
      prize: '$1,000',
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
  const opportunity = getOpportunityById("the-librarians");

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

  const isContest = opportunity.type === 'contest';

  const [activeTab, setActiveTab] = useState<'overview' | 'how' | 'prizes' | 'timeline' | 'rules' | 'specs' | 'legal'>('overview');

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "how", label: "How It Works" },
    { id: "prizes", label: "Prizes" },
    { id: "timeline", label: "Timeline" },
    { id: "rules", label: "Rules" },
    { id: "specs", label: "Submission Specs" },
    { id: "legal", label: "Legal" },
  ];

  const [openAccordions, setOpenAccordions] = useState<Record<string, string | null>>({
    how: null,
    timeline: 'modfd-time-1',
    rules: null,
    specs: 'modfd-spec-2',
  });

  const toggleAccordion = (panel: string, id: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [panel]: prev[panel] === id ? null : id,
    }));
  };

  const [openRule, setOpenRule] = useState<string | null>(null);

const toggleRule = (id: string) => {
  setOpenRule(prev => (prev === id ? null : id));
};

const deadline = new Date("2026-02-29T23:59:59"); // Set your submission deadline

const [timeLeft, setTimeLeft] = useState({
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
  done: false,
});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
          done: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        done: false,
      });
    }, 1000);

  return () => clearInterval(interval);
  }, []);


  return (
    <div>
      {/* Motion graphic insert */}
        {/* <div className="relative w-full overflow-hidden rounded-lg aspect-[21/7]">
                <Image
                  src={opportunity.image || '/placeholder.svg'}
                  alt={opportunity.title}
                  fill
                  className="object-cover"
                />
        </div> */}

    {/* Swiper carousel for images */}
      <div className="relative w-full overflow-hidden rounded-lg aspect-[21/7]">
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          navigation
          aria-live="polite"
          className="w-full"
        >
          <SwiperSlide>
            <img
              loading="lazy"
              alt="The Librarians cast and character imagery"
              src="https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/0726e6f8-83fd-4ac1-a87c-7a6e33df0bc3/24946_001_0507_R.jpg"
              className="w-full h-auto"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              loading="lazy"
              alt="The Librarians cast and character imagery"
              src="https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6536a179-534f-4db7-91d4-db63af09f619/1549733_LIB4306_R.jpg"
              className="w-full h-auto"
            />
          </SwiperSlide>
        </Swiper>
      </div>

    {/* Opportunity details */}
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">{opportunity.title}</h1>
              <div className="flex gap-2">
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

            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={opportunity.organizerLogo || '/placeholder.svg'}
                    alt={opportunity.organizer}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{opportunity.organizer}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                {opportunity.status === 'active' ? 'Active' : 'Closed'}
              </Badge>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>1,245 views</span>
              </div>
            </div>
          
            <Card className="mod-contest-box mb-10">
              <CardContent className="mod-contest-box__inner">
                <h2 className="mod-contest-box__title" ><b>BRING YOUR CREATIVITY INTO THE WORLD OF THE LIBRARIANS!</b></h2>
                <p className="mod-contest-box__lead" >For the first time ever, fan artists are invited to submit original artwork inspired by The Librarians universe — with the opportunity to have your work <b>officially licensed,</b> turned into real merchandise, and sold to fans worldwide.</p>
                <p className="mod-contest-box__sub"><b>This is your chance to move from fan art to canon.</b></p>
                <div className="mod-contest-box__grid">
                  <div className="mod-contest-box__highlight">
                    <h2 className="mod-contest-box__metric">10</h2>
                    <p className="mod-contest-box__metric-label">Artists Selected</p>
                  </div>
                  <div className="mod-contest-box__highlight">
                    <h2 className="mod-contest-box__metric">$100 USD</h2>
                    <p className="mod-contest-box__metric-label">Cash Prize</p>
                  </div>
                  <div className="mod-contest-box__bullets">
                    <p className="mod-contest-box__kicker">What you get</p>
                    <ul className="mod-contest-box__list">
                      <li>Ongoing royalties from merch sales.</li>
                      <li>Officially licensed and showcased artwork.</li>
                      <li>Your design recognized and sold as part of the Official Librarians Fan Merch Collection.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lib-contest-wrap mb-10">
              <div className="lib-copy" aria-label="What to Submit">
                <h2 className="lib-h2">WHAT TO SUBMIT</h2>
                <p className="lib-sub">
                  We’re looking for original fan art inspired by <strong>The Librarians</strong> universe — past, present, or future.
                </p>

                <div className="lib-cards">
                  <Card className="lib-card">
                    <CardContent>
                      <h3 className="lib-card-h3">DRAW INSPIRATION FROM</h3>
                      <ul className="lib-card-ul">
                        <li>Characters</li>
                        <li>Magical artifacts</li>
                        <li>The Library</li>
                        <li>Iconic moments and lore</li>
                        <li>Symbols, themes, or qoutes</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="lib-card">
                    <CardContent>
                      <h3 className="lib-card-h3">STYLES WELCOME</h3>
                      <ul className="lib-card-ul">
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
            </div>

            <div id="mod-full-details" className="modfd">
              <div className="modfd__wrap">
                <h2 className="modfd__title">FULL DETAILS AND GUIDELINES</h2>
                <p className="modfd__subtitle">
                  Everything you need to know to submit fan art for <strong>The Librarians Official Fan Art Contest</strong>. Keep it original, keep it true to the universe, and keep it printable.
                </p>

                {/* <!-- Tabs --> */}
                <div
                  className="modfd__tabs"
                  role="tablist"
                  aria-label="Full details and guidelines tabs"
                >
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`modfd__tab ${
                        activeTab === tab.id ? "is-active" : ""
                      }`}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`modfd-panel-${tab.id}`}
                      id={`modfd-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* <!-- Panels --> */}
                <div
                  className={`modfd__panel ${activeTab === 'overview' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-overview"
                  aria-labelledby="modfd-tab-overview"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">Quick reference</h3>
                    <p className="modfd__muted">
                      We are selecting <strong>10 winning artworks</strong> to become part of the <strong>Official Librarians Fan Merch Collection</strong>.
                      Each winner receives <strong>$100</strong> plus <strong>5% royalties</strong> from every sale of their design.
                    </p>

                    <div className="modfd__grid3">
                      <div className="modfd__miniCard modfd__miniCard--green">
                        <div className="modfd__pill modfd__pill--green">ALLOWED</div>
                          <ul className="modfd__list">
                            <li>Original fan art in your own style</li>
                            <li>Recognizable Librarians inspired elements</li>
                            <li>Respectful, on brand interpretations</li>
                          </ul>
                      </div>

                      <div className="modfd__miniCard modfd__miniCard--red">
                        <div className="modfd__pill modfd__pill--red">NOT ALLOWED</div>
                          <ul className="modfd__list">
                            <li>AI generated art</li>
                            <li>Copied official key art</li>
                            <li>Other franchises or copyrighted IP</li>
                          </ul>
                      </div>

                      <div className="modfd__miniCard modfd__miniCard--amber">
                        <div className="modfd__pill modfd__pill--amber">CHECK FIRST</div>
                          <ul className="modfd__list">
                            <li>Explicit content</li>
                            <li>Hate, harassment, or harmful depictions</li>
                            <li>Anything that could damage the brand</li>
                          </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'how' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-how"
                  aria-labelledby="modfd-tab-how"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">How it works</h3>
                    <p className="modfd__muted">Five steps from your artwork to official merch.</p>

                    <div className="modfd__accordion">
                      {[
                        ['modfd-how-1', 'Submit your artwork', 'Upload your original fan art inspired by The Librarians.'],
                        ['modfd-how-2', 'Review and selection', 'Submissions are reviewed for creativity, quality, and fit with the franchise.'],
                        ['modfd-how-3', 'Winners announced', '10 artists are selected and contacted with next steps.'],
                        ['modfd-how-4', 'Licensing and production', 'Winning designs are officially licensed and produced as merch.'],
                        ['modfd-how-5', 'Get paid', 'Each winner receives $100 cash plus 5% royalties from every sale of their design.'],
                      ].map(([id, title, body], i) => (
                        <div key={id}>
                          <button
                            className="modfd__accHeader"
                            aria-expanded={openAccordions.how === id}
                            aria-controls={id}
                            id={`${id}-h`}
                            onClick={() => toggleAccordion('how', id)}
                          >
                            <span className="modfd__accIcon">{i + 1}</span>
                            <span className="modfd__accTitle">{title}</span>
                            <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                          </button>

                          <div
                            className={`modfd__accBody ${openAccordions.how === id ? 'is-open' : ''}`}
                            hidden={openAccordions.how !== id}
                            id={id}
                            role="region"
                            aria-labelledby={`${id}-h`}
                          >
                            {body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'prizes' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-prizes"
                  aria-labelledby="modfd-tab-prizes"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">Prizes and compensation</h3>
                    <p className="modfd__muted">Clear, simple, and paid.</p>

                    <div className="modfd__grid2">
                      <div className="modfd__box">
                        <h4 className="modfd__boxTitle">WINNERS</h4>
                        <ul className="modfd__list">
                          <li>10 selected submissions</li>
                          <li>Officially licensed artwork</li>
                          <li>Global distribution via the official collection</li>
                        </ul>
                      </div>

                      <div className="modfd__box">
                        <h4 className="modfd__boxTitle">PAYOUT</h4>
                        <ul className="modfd__list">
                          <li>$100 guaranteed per winner</li>
                          <li>5% royalties from every sale of their design</li>
                          <li>Official credit as a licensed fan artist</li>
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'timeline' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-timeline"
                  aria-labelledby="modfd-tab-timeline"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">Timeline</h3>
                    <p className="modfd__muted">Key dates for this contest.</p>

                    <div className="modfd__accordion">
                      <button
                        className="modfd__accHeader"
                        aria-expanded={openAccordions.timeline === 'modfd-time-1'}
                        aria-controls="modfd-time-1"
                        id="modfd-time-h-1"
                        onClick={() => toggleAccordion('timeline', 'modfd-time-1')}
                      >
                        <span className="modfd__accIcon">📅</span>
                        <span className="modfd__accTitle">Dates</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>

                      <div
                        className={`modfd__accBody ${openAccordions.timeline === 'modfd-time-1' ? 'is-open' : ''}`}
                        hidden={openAccordions.timeline !== 'modfd-time-1'}
                        id="modfd-time-1"
                        role="region"
                        aria-labelledby="modfd-time-h-1"
                      >
                        <ul className="modfd__list">
                          <li>
                            <strong>Submissions open:</strong> Now</li>
                                          <li>
                            <strong>Submission deadline:</strong> February 29th, 2026</li>
                                          <li>
                            <strong>Winners announced:</strong> March 5th, 2026</li>
                                          <li>
                            <strong>Merch launch:</strong> Shortly after selection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'rules' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-rules"
                  aria-labelledby="modfd-tab-rules"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">Contest rules</h3>
                    <p className="modfd__muted">
                      Summary rules to keep everything clean, fair, and licensable.
                    </p>

                    <div className="modfd__accordion">

                      {/* MUST BE TRUE */}
                      <button
                        className="modfd__accHeader"
                        aria-expanded={openAccordions.rules === 'modfd-rules-1'}
                        aria-controls="modfd-rules-1"
                        id="modfd-rules-h-1"
                        onClick={() => toggleAccordion('rules', 'modfd-rules-1')}
                      >
                        <span className="modfd__accIcon">✅</span>
                        <span className="modfd__accTitle">Must be true</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>

                      <div
                        className={`modfd__accBody ${openAccordions.rules === 'modfd-rules-1' ? 'is-open' : ''}`}
                        id="modfd-rules-1"
                        role="region"
                        aria-labelledby="modfd-rules-h-1"
                        hidden={openAccordions.rules !== 'modfd-rules-1'}
                      >
                        <ul className="modfd__list">
                          <li>Submissions must be original artwork</li>
                          <li>Artwork must be inspired by The Librarians IP</li>
                          <li>Keep it printable and merch friendly</li>
                        </ul>
                      </div>

                      {/* NOT ALLOWED */}
                      <button
                        className="modfd__accHeader"
                        aria-expanded={openAccordions.rules === 'modfd-rules-2'}
                        aria-controls="modfd-rules-2"
                        id="modfd-rules-h-2"
                        onClick={() => toggleAccordion('rules', 'modfd-rules-2')}
                      >
                        <span className="modfd__accIcon">⛔</span>
                        <span className="modfd__accTitle">Not allowed</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>

                      <div
                        className={`modfd__accBody ${openAccordions.rules === 'modfd-rules-2' ? 'is-open' : ''}`}
                        id="modfd-rules-2"
                        role="region"
                        aria-labelledby="modfd-rules-h-2"
                        hidden={openAccordions.rules !== 'modfd-rules-2'}
                      >
                        <ul className="modfd__list">
                          <li>No AI generated art</li>
                          <li>No copyrighted material from other franchises</li>
                          <li>No copied official key art</li>
                          <li>No explicit, hateful, or harmful content</li>
                        </ul>
                      </div>

                      {/* WHAT WE WANT */}
                      <button
                        className="modfd__accHeader"
                        aria-expanded={openAccordions.rules === 'modfd-rules-3'}
                        aria-controls="modfd-rules-3"
                        id="modfd-rules-h-3"
                        onClick={() => toggleAccordion('rules', 'modfd-rules-3')}
                      >
                        <span className="modfd__accIcon">🎯</span>
                        <span className="modfd__accTitle">What we want you to make</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>

                      <div
                        className={`modfd__accBody ${openAccordions.rules === 'modfd-rules-3' ? 'is-open' : ''}`}
                        id="modfd-rules-3"
                        role="region"
                        aria-labelledby="modfd-rules-h-3"
                        hidden={openAccordions.rules !== 'modfd-rules-3'}
                      >
                        <p className="modfd__muted" style={{ margin: '0 0 10px 0' }}>
                          Create artwork that feels authentically Librarians.
                        </p>
                        <ul className="modfd__list">
                          <li>Illustration, graphic design, typography, poster style</li>
                          <li>Modern or nostalgic</li>
                          <li>Recognizable elements fans instantly know</li>
                        </ul>
                      </div>

                      {/* AGE */}
                      <button
                        className="modfd__accHeader"
                        aria-expanded={openAccordions.rules === 'modfd-rules-4'}
                        aria-controls="modfd-rules-4"
                        id="modfd-rules-h-4"
                        onClick={() => toggleAccordion('rules', 'modfd-rules-4')}
                      >
                        <span className="modfd__accIcon">👤</span>
                        <span className="modfd__accTitle">Age and consent</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>

                      <div
                        className={`modfd__accBody ${openAccordions.rules === 'modfd-rules-4' ? 'is-open' : ''}`}
                        id="modfd-rules-4"
                        role="region"
                        aria-labelledby="modfd-rules-h-4"
                        hidden={openAccordions.rules !== 'modfd-rules-4'}
                      >
                        The contest is open to individuals of all ages. Participants under 18 must
                        have parent or guardian consent and may be asked to confirm.
                      </div>

                    </div>
                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'specs' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-specs"
                  aria-labelledby="modfd-tab-specs"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">Submission specs</h3>
                    <p className="modfd__muted">Make it easy to review and easy to print.</p>

                    <div className="modfd__accordion">
                      <button className="modfd__accHeader" aria-expanded="false" aria-controls="modfd-spec-1" id="modfd-spec-h-1">
                        <span className="modfd__accIcon">🖼️</span>
                        <span className="modfd__accTitle">File format and quality</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>
                      <div className="modfd__accBody" id="modfd-spec-1" role="region" aria-labelledby="modfd-spec-h-1">
                        <ul className="modfd__list">
                          <li>Accepted formats: JPG, PNG, or PDF</li>
                          <li>Minimum 300 DPI recommended</li>
                          <li>Upload clear, high quality images (minimum 1200px on the longest side)</li>
                        </ul>
                      </div>

                      <button className="modfd__accHeader" aria-expanded="true" aria-controls="modfd-spec-2" id="modfd-spec-h-2">
                        <span className="modfd__accIcon">👕</span>
                        <span className="modfd__accTitle">Print size guidance</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>
                      <div className="modfd__accBody is-open" id="modfd-spec-2" role="region" aria-labelledby="modfd-spec-h-2">
                        <p className="modfd__muted" style={{ margin: "0 0 12px 0" }}>
                          Design with apparel printing in mind. A common DTG maximum print area is about <strong>12 by 16 inches</strong>.
                          If you work in pixels, a safe target is about <strong>3600 by 4800 px</strong>.
                        </p>

                        <div className="modfd__imgCard" aria-label="Print size diagram">
                          <img src="https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/9d79a82f-db7a-4980-b7a6-72d5ee7b1674/Screenshot-2026-01-04-at-3-44-57-AM.png" alt="T-shirt print size guidance showing 12 by 16 inch safe print area" loading="lazy" />
                        </div>
                      </div>

                      <button className="modfd__accHeader" aria-expanded="false" aria-controls="modfd-spec-3" id="modfd-spec-h-3">
                        <span className="modfd__accIcon">✍️</span>
                        <span className="modfd__accTitle">Description</span>
                        <span className="modfd__accChevron" aria-hidden="true">⌄</span>
                      </button>
                      <div className="modfd__accBody" id="modfd-spec-3" role="region" aria-labelledby="modfd-spec-h-3">
                        Include a short description of your artwork and what it references in The Librarians universe. Keep it simple and specific.
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`modfd__panel ${activeTab === 'legal' ? 'is-active' : ''}`}
                  role="tabpanel"
                  id="modfd-panel-legal"
                  aria-labelledby="modfd-tab-legal"
                  tabIndex={0}
                >
                  <div className="modfd__card">
                    <h3 className="modfd__cardTitle">LEGAL</h3>
                    <p className="modfd__muted">Key points. Full terms are available at the link below.</p>

                    <div className="modfd__legalBox">
                      <ul className="modfd__legalList">
                        <li>
                          <strong>Original work:</strong> You confirm your submission is your original creation and does not infringe third party rights.</li>
                                      <li>
                          <strong>Permitted fan work:</strong> You may include elements from The Librarians IP for this contest. Any other third party content requires permission.</li>
                                      <li>
                          <strong>Limited promo license:</strong> By submitting, you allow MOD to host and display your submission to run and promote the contest while you retain ownership.</li>
                                      <li>
                          <strong>Winner agreement:</strong> If selected, you will be asked to sign a separate licensing agreement covering commercial use and royalties.</li>
                                      <li>
                          <strong>Removal and disqualification:</strong> Submissions may be removed or disqualified if they violate rules or upon IP owner request.</li>
                                      <li>
                          <strong>Privacy:</strong> Your contact info is used to administer the contest and communicate about prizes and royalties.</li>
                      </ul>

                      {/* <!-- One single button only (per request) --> */}
                      <div className="modfd__legalCta">
                        <a className="modfd__btn" href="https://modfanart.com/pages/submission-terms-and-conditions" target="_blank" rel="noopener">Legal Terms and Conditions</a>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mod-countdown" aria-label="Submission deadline countdown">
        <div className="mod-countdown__wrap">
          <h3 className="mod-countdown__title">Submission Deadline</h3>
          <p className="mod-countdown__subtitle">
            Entries close on <strong>February 29, 2026</strong>. Get your design in
            before time runs out.
          </p>

          {!timeLeft.done ? (
            <div
              className="mod-countdown__timer"
              role="group"
              aria-label="Countdown timer"
            >
              <div className="mod-countdown__box">
                <div className="mod-countdown__num">{timeLeft.days}</div>
                <div className="mod-countdown__label">Days</div>
              </div>
              <div className="mod-countdown__box">
                <div className="mod-countdown__num">{timeLeft.hours}</div>
                <div className="mod-countdown__label">Hours</div>
              </div>
              <div className="mod-countdown__box">
                <div className="mod-countdown__num">{timeLeft.minutes}</div>
                <div className="mod-countdown__label">Minutes</div>
              </div>
              <div className="mod-countdown__box">
                <div className="mod-countdown__num">{timeLeft.seconds}</div>
                <div className="mod-countdown__label">Seconds</div>
              </div>
            </div>
          ) : (
            <div className="mod-countdown__done">
              Submissions are now closed.
            </div>
          )}
        </div>
      </div>

      <Card className="container my-10 p-6 md:p-10">
        <div className="space-y-4">
          <Link href={`/submissions/new?opportunity=${opportunity.id}`} className="modfd__btn w-full justify-center">
            <Button className="modfd__btn w-full justify-center">
              Submit Your Artwork
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            Submission will open in your dashboard
          </p>
        </div>
      </Card>
      </div>

      </div>
  );
}
