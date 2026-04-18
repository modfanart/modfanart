'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LayoutWrapper } from '@/components/layouts/layout-wrapper';
// SafeImage: renders a real Next/Image when src exists, otherwise a placeholder div
import { ImageProps } from 'next/image';

type SafeImageProps = {
  src?: string | null;
  alt?: string;
  fill?: boolean;
  className?: string;
} & Omit<ImageProps, 'src' | 'alt' | 'fill'>;

function SafeImage({ src, alt = '', fill = false, className = '', ...rest }: SafeImageProps) {
  const isEmpty = !src || String(src).trim() === '';

  if (isEmpty) {
    return (
      <div
        aria-label={alt || 'image placeholder'}
        className={`relative w-full h-full ${className} bg-gray-200 animate-pulse`}
      />
    );
  }

  return <Image src={src} alt={alt} fill={fill} className={className} {...rest} />;
}

export default function HomePage() {
  const images = [
    'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/2331c71fb8e497567176ade34ff7b72c0b0d3594_f2s2gp', // top-left
    'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/ae950b44c9b4311155d3820c4406ac501b12527a_ig1tdr', // top-right
    'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/b2ba556c28829d4a1b763b4887112c3a2c18fa16_n0lii0', // bottom-left
    'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/0672b8107e6a5934d017d3d77f0e0289150a6fc1_xxbpsq', // bottom-right
  ];
  return (
    <LayoutWrapper>
      <main className="w-full overflow-x-hidden">
        {/* ================= HERO ================= */}
        <section className="relative w-full h-[80vh] min-h-[420px] overflow-hidden">
          {/* BG */}
          <SafeImage
            src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-1_m1qic6"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          {/* HEADLINE */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center text-white max-w-3xl px-4 z-20 mb-10">
            <h1 className="text-5xl font-extrabold leading-tight">
              TURN <span className="text-purple-400">FAN ART</span> INTO
              <br />
              OFFICIAL OPPORTUNITIES
            </h1>
            <p className="mt-4 text-sm text-gray-300">
              MOD Fan Official is a structured fan licensing platform that connects artists and
              brands through brand-approved submissions, official reviews, and licensed merchandise
              drops. Every design enters through a structured review and licensing process.
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Brand approval ensures each release meets official guidelines and quality standards.
              Every licensed drop is backed directly by the IP holder.
            </p>
          </div>
        </section>

        {/* BRIDGING CARDS */}
        <section className="relative z-20 flex flex-col items-center gap-6 px-4 bg-[#E9E3F5]">
          {/* Cards row */}
          <div className="flex justify-center gap-6 flex-wrap -mt-36">
            {[
              {
                src: 'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-2_buiw8t',
                label: 'For Artists',
              },
              {
                src: 'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-3_jarrp0',
                label: 'For Brands',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-2xl group transition-all transform hover:scale-105"
              >
                <SafeImage src={card.src} alt={card.label} fill className="object-cover" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Button className="rounded-full bg-white text-black text-xs px-5 py-2 transition-all transform group-hover:scale-105">
                    ✔ {card.label}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA below cards, in normal flow */}
          <Button className="rounded-full bg-black text-white text-sm px-6 py-2 hover:bg-white hover:text-black transition-colors duration-200">
            👁 View Active Contests
          </Button>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-[#E9E3F5] py-24 px-6 text-center animate-fade-in-up ">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold">
              HOW <span className="text-purple-500">MOD</span> WORKS
            </h2>

            <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
              Fan art has always been part of culture. What’s been missing is a clear, legal way for
              it to become official. MOD creates that path.
            </p>

            <div className="mt-12 flex flex-col md:flex-row items-center justify-center md:gap-6 gap-4">
              {[
                'Artists submit fan creations as part of real brand campaigns.',
                'Each submission is screened using MOD’s AI-powered review system...',
                'Brands review what fits and approve what they want to license.',
              ].map((text, i) => (
                <div
                  key={i}
                  className="bg-[#DCD3F2] rounded-xl px-5 py-4 text-xs w-[240px] shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  {text}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="bg-purple-500 text-white text-xs px-6 py-3 rounded-full inline-block">
                ✔ Approved designs move forward as officially licensed merchandise.
              </div>

              <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
                No guessing. No copyright gray areas. <br /> Just a process that respects both
                creativity and IP.
              </p>
            </div>
          </div>
        </section>

        {/* ================= BUILT FOR ================= */}
        <section className="bg-black text-white py-24 px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Brands */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-semibold">Built for Brands</h3>
                <p className="mt-4 text-gray-400 text-sm">
                  Fans already create artwork inspired by your IP. That doesn’t stop whether you
                  engage or not. MOD gives brands a way to participate without losing control.
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  You set the rules. <br />
                  You review submissions. <br />
                  You decide what becomes official. The result is safer fan engagement, licensed fan
                  merchandise, and campaigns that feel intentional instead of risky.
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  For brands that want fan engagement without putting their IP at risk.
                </p>
              </div>
              <div className="relative h-[320px] rounded-2xl overflow-hidden">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-4_zqgxz6"
                  alt="Brand art"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Artists */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="relative h-[320px] rounded-2xl overflow-hidden">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-5_lzkqew"
                  alt="Artist art"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="text-2xl font-semibold">Built for Artists</h3>
                <p className="mt-4 text-gray-400 text-sm">
                  Most fan art lives in a legal gray zone.
                  <br /> That makes it hard to share, harder to monetize, and nearly impossible to
                  build a future around. MOD gives artists a real way in.
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  You submit work tied to official fan art contests.
                  <br /> Your designs are reviewed instead of ignored.
                  <br /> If approved, your work becomes licensed merchandise and earns royalties.
                </p>
                <p className="mt-2 text-gray-400 text-sm">
                  When your design is selected, it becomes officially licensed merchandise backed by
                  the brand, with real recognition and royalties attached.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURED ================= */}
        <section className="bg-white py-24 px-6 text-center" aria-label="Featured campaigns">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold">FEATURED CAMPAIGNS</h2>
            <p className="mt-3 text-sm text-gray-600">
              MOD runs official fan art licensing campaigns with brands across entertainment,
              gaming, media, and fandom culture.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Each campaign includes:
              <br />
              <div className="bg-gray-200 text-black font-semibold text-xs px-6 py-3 rounded-full inline-block">
                ✔ Clear brand guiedlines
              </div>
              <div className="bg-gray-200 text-black font-semibold text-xs px-6 py-3 rounded-full inline-block">
                ✔ Defined Submission Windows
              </div>
              <br />
              <div className="bg-gray-200 text-black font-semibold text-xs px-6 py-3 rounded-full inline-block">
                ✔ Brand-led Review and Approval
              </div>
              <div className="bg-gray-200 text-black font-semibold text-xs px-6 py-3 rounded-full inline-block">
                ✔ Licensed Merchandise Outcomes
              </div>
            </p>
            {/*Refactor featured campaigns*/}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-6_lwboni',
                'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-7_uozyzg',
                'https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-8_pdl9fw',
              ].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative h-48">
                    <SafeImage src={i} alt="" fill className="object-cover" />
                  </div>
                  <div className="p-4 text-left">
                    <h4 className="font-medium">Campaign Title</h4>
                    <Button className="mt-3 text-xs rounded-full">View and Enter</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= WHY ================= */}
        <section className="bg-[#F3F3F3] py-20 px-6" aria-label="Why MOD exists">
          <div className="max-w-5xl mx-auto">
            {/* Title */}
            <h2 className="text-4xl font-black text-center tracking-wide mb-12">
              WHY <span className="text-purple-500">MOD</span> EXISTS
            </h2>

            {/* Two-column body */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Left: bullet points */}
              <div className="flex-1 space-y-7">
                {[
                  {
                    icon: '💡',
                    color: 'bg-purple-100',
                    text: "Fan creativity has always driven fandom forward. Licensing systems just weren't built to include it.",
                  },
                  {
                    icon: '🎨',
                    color: 'bg-pink-100',
                    text: 'We believe fan art deserves structure, not chaos. We believe brands should be able to collaborate without risk.',
                  },
                  {
                    icon: '🔗',
                    color: 'bg-indigo-100',
                    text: 'And we believe official pathways create better outcomes than gray areas ever could.',
                  },
                  {
                    icon: '❓',
                    color: 'bg-violet-100',
                    text: 'Artists were left guessing what was allowed. Brands were left choosing between enforcement or silence. MOD exists to change that.',
                  },
                ].map(({ icon, color, text }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div
                      className={`${color} rounded-full w-9 h-9 flex items-center justify-center shrink-0 text-base`}
                    >
                      {icon}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* Right: staggered 2×2 image grid */}
              <div className="flex-1 flex gap-x-3">
                {/* Left image column — offset down */}
                <div className="flex flex-col gap-3 mt-10">
                  {[images[0], images[2]].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Fan art ${i + 1}`}
                      className="rounded-2xl w-[200px] h-[200px] object-cover"
                    />
                  ))}
                </div>

                {/* Right image column — sits higher */}
                <div className="flex flex-col gap-3">
                  {[images[1], images[3]].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Fan art ${i + 2}`}
                      className="rounded-2xl w-[200px] h-[200px] object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="mt-12 flex justify-center">
              <Button className="rounded-full px-8 py-2 bg-gray-900 text-white text-sm flex items-center gap-2 hover:bg-gray-700">
                <span className="text-base">ℹ</span> About Us
              </Button>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="bg-black py-24 px-6">
          <div className="max-w-5xl mx-auto text-center text-white relative rounded-2xl overflow-hidden">
            {/* glow */}
            <div className="absolute inset-0 bg-purple-600 mix-blend-multiply filter blur-3xl opacity-40" />

            <div className="relative z-10 p-12">
              <h2 className="text-4xl font-bold">
                READY TO <span className="text-purple-400">GET STARTED?</span>
              </h2>
              <p className="mt-4 text-gray-300 text-sm">
                Whether you’re a brand looking to activate your fandom safely or an artist looking
                to monetize fan art legally, MOD Fan Official gives you a clear place to start.
              </p>

              <div className="mt-6 flex justify-center gap-3 flex-wrap">
                {['Explore campaigns', 'Submit artwork', 'Launch brand activation'].map((t, i) => (
                  <div
                    key={i}
                    className="bg-white/10 px-4 py-2 rounded-full text-xs hover:bg-white/20 transition-colors"
                  >
                    ✔ {t}
                  </div>
                ))}
              </div>

              <p className="mt-6 text-gray-300 text-big">
                Turn fan passion into official partnerships.
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <Button className="bg-purple-600 rounded-full px-6">Sign Up Now</Button>
                <Button variant="outline" className="text-black rounded-full px-6">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </LayoutWrapper>
  );
}
