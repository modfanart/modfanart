"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { CheckCircle2, Shield, Coins, FileCheck, Handshake, Ribbon, Palette } from "lucide-react";

// ── SafeImage ──────────────────────────────────────────────────────────────────
function SafeImage({ src, alt = "", fill = false, className = "", ...rest }: any) {
  const isEmpty = !src || String(src).trim() === "";
  if (isEmpty) {
    return (
      <div className={`relative ${fill ? "w-full h-full" : "w-full h-full"} ${className} bg-gray-200`}>
        <span className="sr-only">{alt || "Image placeholder"}</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill={fill} className={className} {...rest} />;
}

// ── Image grid placeholders ────────────────────────────────────────────────────
const originImages = [
  "", // col1 top
  "", // col2 top
  "", // col3 top
  "", // col4 top
  "", // col1 mid
  "", // col2 mid (large - Medusa)
  "", // col3 mid
  "", // col1 bottom (large - reclining)
  "", // col4 bottom
];

const futureImages = [
  "", "", "", "", "",
  "", "", "", "", "",
  "", "", "", "", "",
];

// Avatar placeholder URLs — swap with real headshots
const avatars = ["", "", "", "", ""];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
      <main className="w-full overflow-x-hidden">

        {/* ═══════════════════════════ HERO ═══════════════════════════ */}
        <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
          <SafeImage
            src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-1_m1qic6"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              WE BELIEVE FANDOM
              </h1>
              <br />
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight ">
              DESERVES{" "}
              <span className="bg-purple-600 text-white px-[4px] py-0 leading-none rounded-sm">
                OFFICIAL
              </span>{" "}
              </h1>
              <br />
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight ">
              PATHWAYS
            </h1>

            <p className="mt-8 text-sm text-gray-300 max-w-2xl leading-relaxed">
              Fan art has always been part of culture. It's how people show connection, loyalty, and creativity
              around the things they love.
              <br />
              But for a long time, there was no clear place for that creativity to go. Artists were created in
              legal gray areas.
            </p>
            <p className="mt-4 text-sm text-gray-300 max-w-xl leading-relaxed">
              Brands were forced to choose between ignoring it or shutting it down.
              <br />
              And both sides were missing real opportunities because the system wasn't built for collaboration.
              <br />
              MOD Fan Official exists to change that.
            </p>
          </div>
        </section>

        {/* ═══════════════════════ WHY MOD WAS CREATED ════════════════════════ */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Shield size={20} className="text-purple-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                WHY MOD WAS CREATED
              </h2>
            </div>

            {/* Split card */}
            <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg">
              {/* Left — dark text */}
              <div className="flex-1 bg-[#111] text-white p-10">
                <p className="text-sm text-gray-300 leading-relaxed">
                  MOD began in 2020 as a merchandise solution for artists and creators.
                  <br />
                  But something quickly became clear.
                  <br />
                  Fans were already creating incredible work inspired by shows, games, music, and brands.
                </p>
                <p className="mt-5 text-sm text-gray-300 leading-relaxed">
                  The talent was there.
                  <br />
                  The demand was there.
                </p>
                <p className="mt-5 text-sm text-gray-300 leading-relaxed">
                  What was missing was structure.
                  <br />
                  There was no simple, legal way for fan art to move from inspiration to official licensing.
                  <br />
                  So we built MOD to fill that gap, not as a marketplace, but as a platform designed around
                  approval, compliance, and trust.
                </p>
              </div>

              {/* Right — image */}
              <div className="relative w-full md:w-[380px] h-[300px] md:h-auto rounded-b-3xl md:rounded-r-3xl overflow-hidden">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/3e65e5549105cc8d3d7c0ebe62febc058563382d_fqrmwf"
                  alt="Why MOD was created"
                  fill
                  className="object-cover"
                />
              </div>
              
            </div>
          </div>
        </section>

        {/* ═══════════════════════ WHAT MOD ACTUALLY DOES ════════════════════════ */}
        <section className="bg-white py-20 px-6 ">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              WHAT <span className="text-purple-500">MOD</span> ACTUALLY DOES
            </h2>

            <p className="mt-8 text-sm text-gray-600 leading-relaxed">
              MOD is a fan licensing infrastructure platform.
              <br />
              <strong>We create structured pathways where:</strong>
            </p>

            {/* 2x2 numbered grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {[
                "Artists submit fan creations through official campaigns",
                "Brands review work based on their own guidelines",
                "Approved designs become licensed merchandise",
                "Artists earn royalties from official releases",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-2xl px-6 py-5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Every step is structured and supported by intelligent automation designed to streamline review,
              protect brand standards, and maintain transparency.
            </p>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Our system combines AI-assisted screening with brand-led approval, making collaboration possible
              at scale while preserving full human oversight.
            </p>
          </div>
        </section>

        {/* ═══════════════════ OUR APPROACH TO CREATIVITY ════════════════════ */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center leading-tight mb-12">
              OUR APPROACH TO
              <br />
              <span className="text-purple-500">CREATIVITY</span> AND{" "}
              <span className="text-purple-500">LICENSING</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-10 items-start max-w-3xl mx-auto">
              {/* Left — text */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">
                  We believe creativity thrives when expectations are clear.
                  <br />
                  Artists deserve to know what's allowed.
                  <br />
                  Brands deserve control over how their IP is used.
                  <br />
                  And fandom deserves better than silence or takedowns.
                </p>
                <p className="mt-5 text-sm text-gray-600">MOD is built around:</p>

                <div className="mt-4 space-y-3">
                  {[
                    { icon: <Shield size={15} />,     text: "Respect for intellectual property" },
                    { icon: <Coins size={15} />,      text: "Fair royalty structures for artists" },
                    { icon: <FileCheck size={15} />,  text: "Transparent licensing processes" },
                    { icon: <Handshake size={15} />,  text: "Long-term collaboration over short-term wins" },
                  ].map(({ icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-purple-500 shrink-0" />
                      <span className="text-sm font-bold text-gray-800">{text}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-sm text-gray-500 leading-relaxed">
                  This isn't about exploiting fan passion.
                  <br />
                  It's about building something sustainable.
                </p>
              </div>

              {/* Right — 2x2 image + icon grid */}
              {/* Right — 2x2 image + icon grid */}
                <div className="flex-shrink-0 flex gap-3">
                {/* Left column */}
                <div className="flex flex-col gap-3 mt-8">
                    <div className="w-[160px] h-[160px] bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Ribbon size={48} className="text-purple-500" />
                    </div>
                    <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden bg-gray-200">
                    <SafeImage
                        src="https://res.cloudinary.com/dbsdj2f2l/image/upload/v1776133975/ae950b44c9b4311155d3820c4406ac501b12527a_ig1tdr.png"
                        alt="Fan art"
                        fill
                        className="object-cover"
                    />
                    </div>
                </div>

                {/* Right column — sits higher */}
                <div className="flex flex-col gap-3">
                    <div className="relative w-[160px] h-[160px] rounded-2xl overflow-hidden bg-gray-200">
                    <SafeImage
                        src="https://res.cloudinary.com/dbsdj2f2l/image/upload/v1776133960/2331c71fb8e497567176ade34ff7b72c0b0d3594_izougv.png"
                        alt="Fan art"
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div className="w-[160px] h-[160px] bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Palette size={48} className="text-purple-500" />
                    </div>
                </div>
                </div>
              </div>
            </div>
        </section>

        {/* ═══════════════════════ THE FUTURE ════════════════════════ */}
        <section className="bg-white py-10 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden min-h-[360px]">
              <div className="absolute inset-0">
                <SafeImage
                    src="https://res.cloudinary.com/dbsdj2f2l/image/upload/v1776140287/139c141d33b5a1332264d9b595106f61c70b96e1_flqvsi.png"
                    alt=""
                    fill
                    className="object-cover"
                />
                </div>

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-8 py-16">
                <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  THE <span className="text-purple-400">FUTURE</span> WE'RE
                  <br />
                  WORKING TOWARD
                </h2>
                <p className="mt-6 text-sm text-gray-300 max-w-xl leading-relaxed">
                  We see a future where fan licensing isn't an exception, it's standard.
                  <br />
                  Where brands don't see fan art as a risk, but as a resource.
                  <br />
                  Where artists can build careers through licensed fandom work.
                </p>
                <p className="mt-4 text-sm text-gray-300 max-w-xl leading-relaxed">
                  And where official collaboration replaces legal gray zones.
                  <br />
                  Our goal is to make fan licensing a recognized industry standard, one campaign,
                  one artist, and one brand partnership at a time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ JOIN CTA ════════════════════════ */}
        <section className="bg-white py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">

            {/* Overlapping avatars */}
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-gray-300"
                  >
                    <SafeImage src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              JOIN THE PLATFORM BUILT FOR
              <br />
              OFFICIAL COLLABORATION
            </h2>

            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              Whether you're a brand looking to activate your fandom safely
              <br />
              or an artist looking for a legitimate way to get licensed,
              <br />
              MOD Fan Official was built with you in mind.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                "Explore the platform.",
                "See how campaigns work.",
                "Be part of a system designed to respect both creativity and IP.",
              ].map((text, i) => (
                <Button
                  key={i}
                  className="bg-purple-600 hover:bg-purple-700 rounded-full px-6 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> {text}
                </Button>
              ))}
            </div>
          </div>
        </section>

      </main>
  );
}
