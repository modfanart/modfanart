"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/components/layout-wrapper";
import {
  UserCircle,
  Upload,
  BadgeCheck,
  Scroll,
  XCircle,
  ChevronDown,
  Star,
  CheckCircle2,
} from "lucide-react";

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

// ── FAQ Accordion ──────────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-5 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{question}</span>
        <ChevronDown
          size={18}
          className={`text-purple-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && <p className="mt-3 text-sm text-gray-500 leading-relaxed">{answer}</p>}
    </div>
  );
}

// ── Artist Card ────────────────────────────────────────────────────────────────
function ArtistCard({ src, name, brand }: { src: string; name: string; brand: string }) {
  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden">
      <div className="relative w-full h-[220px]">
        <SafeImage src={src} alt={name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm font-semibold">{name}</span>
          <BadgeCheck size={14} className="text-purple-400 shrink-0" />
        </div>
        <p className="text-gray-400 text-xs mt-0.5">Licensed to: {brand}</p>
      </div>
    </div>
  );
}

// ── Opportunity image grid placeholders ───────────────────────────────────────
const opportunityImages = [
  "", // top-left
  "", // top-center
  "", // top-right
  "", // middle (large center)
  "", // bottom-left
  "", // bottom-right
];

// ── Artist cards placeholder data ─────────────────────────────────────────────
const artistCards = [
  { src: "", name: "Jake Muller",   brand: "Brand Name" },
  { src: "", name: "Katie Fang",    brand: "Brand Name" },
  { src: "", name: "Derek Cooper",  brand: "Brand Name" },
  { src: "", name: "Kevin Richner", brand: "Brand Name" },
  { src: "", name: "Jake Raven",    brand: "Brand Name" },
  { src: "", name: "Stacey Carter", brand: "Brand Name" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ForArtistsPage() {
  return (
    <LayoutWrapper>
      <main className="w-full overflow-x-hidden">

        {/* ═══════════════════════════ HERO ═══════════════════════════ */}
        <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
          <SafeImage
            src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/homepage-5_lzkqew"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              CREATE WHAT YOU LOVE.
              </h1>
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mt-2">
              GET IT OFFICIALLY{" "}
              <span className="bg-purple-600 text-white px-1 py-0 leading-none rounded-sm">LICENSED.</span>
            </h1>

            <p className="mt-6 text-sm text-gray-300 max-w-2xl leading-relaxed">
              Fan art has always been powerful. Turning it into something official has always been the hard part.
              <br />
              MOD Fan Official gives artists a real path to get fan art licensed, approved, and turned into official
              merchandise, without guessing what's allowed or risking takedowns.
            </p>
            <p className="mt-3 text-sm text-gray-300 max-w-xl leading-relaxed">
              This isn't about uploading anything you want.
              <br />
              It's about getting access to real brand opportunities.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-8 text-sm flex items-center gap-2">
                <Upload size={15} /> Submit Your Art
              </Button>
              <span className="text-sm text-gray-300 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">
                Join the Community
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ PROBLEM WITH FAN ART ════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center">
              THE PROBLEM WITH <span className="text-purple-500">FAN ART</span>
            </h2>
            <p className="mt-5 text-sm text-gray-500 text-center">Most fan art lives in a gray area.</p>

            <div className="mt-8 space-y-3 flex flex-col items-center max-w-lg mx-auto">
              {[
                "Artists pour time and skill into work they can't legally monetize.",
                "Designs get taken down without warning.",
                "Brands feel unreachable.",
                "And talent often goes unseen.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-100 rounded-xl px-5 py-4 w-full"
                >
                  <XCircle size={18} className="text-purple-500 shrink-0" />
                  <span className="text-sm font-bold text-gray-800">{text}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500 text-center">
              Even great work struggles to move forward when there's no clear approval process behind it.
            </p>
          </div>
        </section>

        {/* ══════════════════════ THE OPPORTUNITY MOD CREATES ══════════════════════ */}
        <section className="bg-white py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg bg-[#F4F4F4] border border-blue-200">
              {/* Left text */}
              <div className="flex-1 p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-purple-500 text-2xl">✳</span>
                  <h3 className="text-2xl font-bold leading-tight">
                    The Opportunity
                    <br />
                    MOD Creates
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  MOD was built to give <strong>fan artists</strong> a legitimate way in.
                  Instead of posting into the void, artists submit work through official campaigns.
                </p>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  Instead of hoping for permission, artists work within{" "}
                  <strong>brand guidelines.</strong>
                  <br />
                  Instead of worrying about <strong>copyright</strong>, artists know exactly where they stand.
                </p>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  When a <strong>design is approved</strong>, it's not just seen, it's licensed.
                </p>
              </div>

              {/* Right: image collage grid */}
              <div className="relative w-full md:w-[380px] h-[300px] md:h-auto rounded-b-3xl md:rounded-r-3xl overflow-hidden">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/b83e2b8a269a206ccdf3a5990231c3721c01e399_q1enne"
                  alt="The Opportunity MOD Creates"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ HOW MOD WORKS FOR ARTISTS ════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center leading-tight">
              HOW MOD WORKS FOR
              <br />
              <span className="text-purple-500">ARTISTS</span>
            </h2>

            <div className="mt-14 space-y-10">
              {[
                {
                  icon: <UserCircle size={20} className="text-purple-500" />,
                  title: "Create Your Profile",
                  body: "Set up your artist profile and showcase your style. This helps brands understand who you are and how you approach your work.",
                },
                {
                  icon: <Upload size={20} className="text-purple-500" />,
                  title: "Submit to Official Campaigns",
                  body: "Artists submit fan art tied to active brand campaigns, each with clear rules and creative direction.",
                },
                {
                  icon: <BadgeCheck size={20} className="text-purple-500" />,
                  title: "Brand Review & Approval",
                  body: "Submissions are reviewed against brand guidelines. Brands decide what moves forward.",
                },
                {
                  icon: <Scroll size={20} className="text-purple-500" />,
                  title: "Get Licensed & Earn",
                  body: "Approved designs become officially licensed merchandise. Artists earn royalties and receive proper credit for their work.\n\nEvery submission goes through a structured review process designed to highlight standout work and align it with official brand standards.\nWhen selected, your design becomes officially licensed merchandise with real recognition and royalty participation.",
                },
              ].map(({ icon, title, body }, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-purple-200 mt-2" />}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-bold text-base">{title}</h4>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed whitespace-pre-line">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ WHAT ARTISTS GAIN ════════════════════════ */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-10">
              WHAT <span className="text-purple-500">ARTISTS</span> GAIN
            </h2>

            <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg">
              {/* Left — dark */}
              <div className="flex-1 bg-[#111] text-white p-10 space-y-7">
                {[
                  {
                    title: "Royalties",
                    body: "Earn from licensed fan merchandise when your designs are approved and sold.",
                  },
                  {
                    title: "Official Recognition",
                    body: "Your work is backed by the brand, not sitting in a gray zone.",
                  },
                  {
                    title: "Exposure That Matters",
                    body: "Being selected for a licensed campaign carries real weight, not just likes.",
                  },
                  {
                    title: "Portfolio Credibility",
                    body: "Licensed work strengthens your portfolio and opens doors to future opportunities.",
                  },
                ].map(({ title, body }, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <BadgeCheck size={18} className="text-purple-400 shrink-0" />
                      <h4 className="font-bold text-sm">{title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed pl-6">{body}</p>
                  </div>
                ))}
              </div>

              {/* Right — artist image */}
              <div className="relative w-full md:w-[320px] h-[320px] md:h-auto rounded-b-3xl md:rounded-r-3xl">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/5094758d4a3119d4930f120bf8d68a818dce496a_jajdo8"
                  alt="Artist at work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-semibold text-gray-800">
              MOD isn't about shortcuts.
              <br />
              It's about building something real.
            </p>
          </div>
        </section>

        {/* ══════════════════════ FEATURED ARTIST WORK ════════════════════════ */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star size={32} className="text-purple-500 fill-purple-500" />
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">FEATURED ARTIST WORK</h2>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Artists on MOD don't just share fan art, they participate in licensed campaigns.
            </p>
            <p className="mt-4 text-sm text-gray-600 font-medium">Every featured design:</p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {[
                "Was submitted to an official campaign",
                "Followed brand guidelines",
                "Was reviewed and approved by the IP holder",
                "Became licensed merchandise",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2 text-sm font-semibold text-gray-800"
                >
                  <CheckCircle2 size={14} className="text-purple-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <p className="mt-5 text-sm text-gray-500 italic">
              What you see here isn't popular. It's approval.
            </p>

            {/* Artist grid */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
              {artistCards.map((card, i) => (
                <ArtistCard key={i} src={card.src} name={card.name} brand={card.brand} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ READY TO SUBMIT CTA ════════════════════════ */}
        <section className="bg-white py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-black text-white text-center py-16 px-8">
              {/* purple glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-40 bg-purple-600 blur-[80px] opacity-60 rounded-full" />
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  READY TO SUBMIT
                  <br />
                  YOUR ART?
                </h2>
                <p className="mt-5 text-sm text-gray-300 max-w-xl mx-auto">
                  If you've been creating fan art and wondering how to take the next step, this is where it starts.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {[
                    "Explore active contests.",
                    "Read the guidelines.",
                    "Submit your work with confidence.",
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 text-xs font-medium hover:bg-white/20 transition-colors"
                    >
                      <CheckCircle2 size={13} className="text-purple-400" /> {t}
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col items-center gap-3">
                  <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-8 flex items-center gap-2">
                    <Upload size={15} /> Submit Your Art
                  </Button>
                  <span className="text-sm text-gray-300 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">
                    Join the Community
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ FAQ ════════════════════════ */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-10">
              FREQUENTLY ASKED QUESTIONS
            </h2>

            {[
              {
                question: "What kind of fan art can I submit?",
                answer: "You can submit fan art tied to active brand campaigns on MOD. Each campaign has its own creative brief and brand guidelines that outline what's acceptable. You must submit within those defined parameters.",
              },
              {
                question: "How long does approval take?",
                answer: "Approval timelines vary by campaign and brand. Once submitted, your work enters a structured review queue. You'll be notified of the status through your artist dashboard.",
              },
              {
                question: "Do I keep ownership of my art?",
                answer: "Artists retain creative credit for their work. When a design is licensed, a formal agreement outlines usage rights. You are always credited as the original creator of the licensed piece.",
              },
              {
                question: "How do royalties work?",
                answer: "When your approved design is sold as licensed merchandise, you earn a royalty based on the terms set in your licensing agreement. Sales and payouts are tracked transparently through the platform.",
              },
              {
                question: "Is there a cost to join?",
                answer: "Creating an artist profile and submitting to campaigns is free. MOD earns through the licensing and merchandise process, not by charging artists upfront.",
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

      </main>
    </LayoutWrapper>
  );
}
