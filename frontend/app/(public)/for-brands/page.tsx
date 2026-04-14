"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/components/layout-wrapper";
import {
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Receipt,
  Megaphone,
  MapPin,
  BadgeCheck,
  Scroll,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";

// ── SafeImage (same pattern as homepage) ──────────────────────────────────────
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

// ── FAQ Accordion item ─────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-gray-200 py-5 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{question}</span>
        <ChevronDown
          size={18}
          className={`text-purple-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ForBrandsPage() {
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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 mt-16 z-20">
            <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
              ACTIVATE YOUR{" "}
              <span className="bg-purple-600 text-white px-2 rounded-sm">FANDOM.</span>
              <br />
              LICENSE CREATIVITY ON
              <br />
              YOUR TERMS.
            </h1>

            <p className="mt-6 text-sm text-gray-300 max-w-2xl leading-relaxed">
              MOD Fan Official helps brands turn fan creativity into officially licensed merchandise through structured
              campaigns, clear guidelines, and brand-led approval. Fans already create art inspired by your IP.
              <br />
              MOD gives you a safe, controlled way to engage it, without losing ownership, control, or credibility.
            </p>
            <p className="mt-3 text-sm text-gray-300 max-w-2xl leading-relaxed">
              MOD is more than a marketplace. It is structured licensing infrastructure designed to help you activate
              fan creativity with intelligence and control. Nothing goes live without your approval.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-white font-bold tracking-widest text-sm">LAUNCH A CAMPAIGN</span>
              <Button className="bg-purple-600 hover:bg-purple-700 rounded-full px-6 text-sm flex items-center gap-2">
                <CalendarCheck size={15} /> Book a Demo
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════ PROBLEM BRANDS FACE ════════════════════════ */}
        <section className="bg-white py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              THE PROBLEM <span className="text-purple-500">BRANDS</span> FACE
            </h2>
            <p className="mt-5 text-sm text-gray-500">Fan art doesn't stop because a brand ignores it.</p>

            {/* Pills */}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {[
                "It shows up on social media.",
                "It appears on marketplaces.",
                "It spreads without context, credit, or permission.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2 text-sm font-semibold text-gray-800"
                >
                  <CheckCircle2 size={15} className="text-purple-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-gray-500 leading-relaxed">
              Most brands don't have the time or internal resources to review thousands of submissions.
              <br />
              Enforcement alone creates friction with the community.
              <br />
              And leaving things unaddressed creates risk.
            </p>

            <p className="mt-6 text-lg font-medium">
              The result is a{" "}
              <span className="text-purple-500 underline decoration-purple-400 decoration-wavy underline-offset-4">
                lose-lose situation,
              </span>{" "}
              for brands and for fans.
            </p>
          </div>
        </section>

        {/* ══════════════════════ THE MOD APPROACH ════════════════════════ */}
        <section className="bg-white py-6 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg bg-[#F4F4F4]">
              {/* Left text */}
              <div className="flex-1 p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-purple-500 text-2xl">✳</span>
                  <h3 className="text-2xl font-bold">The MOD Approach</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  MOD was built to solve this problem with structure, not shortcuts.
                  <br />
                  Instead of fighting fan creativity,{" "}
                  <strong>MOD gives brands a way to guide it.</strong>
                </p>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  <strong>You define what's allowed.</strong>
                  <br />
                  Artists submit work within those boundaries.
                  <br />
                  Nothing moves forward without review.
                  <br />
                  Only approved designs become licensed merchandise.
                </p>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  This <strong>keeps your IP protected</strong> while opening the door to real engagement and new revenue.
                </p>
              </div>
              {/* Right image */}
              <div className="relative w-full md:w-[380px] h-[300px] md:h-auto rounded-b-3xl md:rounded-r-3xl overflow-hidden">
                <SafeImage
                  src="https://res.cloudinary.com/dbsdj2f2l/image/upload/f_auto,q_auto/c07eda66dd1babdc83870735c03fdb85545b64f9_rmfoiz"
                  alt="The MOD Approach"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ HOW MOD WORKS ════════════════════════ */}
        <section className="bg-white py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center leading-tight">
              HOW MOD WORKS
              <br />
              FOR <span className="text-purple-500">BRANDS</span> & IP HOLDERS
            </h2>

            <div className="mt-14 space-y-10">
              {[
                {
                  icon: <BookOpen size={20} className="text-purple-500" />,
                  title: "Set Your Brand Guidelines",
                  body: "You decide what's acceptable, what's off-limits, and what fits your brand. These guidelines shape every submission.",
                },
                {
                  icon: <ShieldCheck size={20} className="text-purple-500" />,
                  title: "Review Submissions",
                  body: "Artists submit work tied to your campaign. Submissions are screened using MOD's AI-powered review system, which automatically evaluates designs against your brand guidelines, flags potential issues, and shortlists relevant work before it reaches your dashboard.\n\nYou can rely on intelligent automation while retaining full human approval authority at any time and at your discretion.",
                },
                {
                  icon: <CheckCircle2 size={20} className="text-purple-500" />,
                  title: "License Approved Art",
                  body: "You choose what moves forward. Approved designs are licensed under terms you control, including usage and royalties.",
                },
                {
                  icon: <Receipt size={20} className="text-purple-500" />,
                  title: "Generate Licensed Revenue",
                  body: "Approved artwork becomes official merchandise. Sales are tracked, royalties are distributed, and everything stays transparent. At every step, control stays with you.",
                },
              ].map(({ icon, title, body }, i) => (
                <div key={i} className="flex gap-5">
                  {/* Icon column with connecting line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-purple-200 mt-2" />}
                  </div>
                  {/* Text */}
                  <div className="pb-6">
                    <h4 className="font-bold text-base">{title}</h4>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed whitespace-pre-line">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ WHY BRANDS CHOOSE MOD ════════════════════════ */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-10">
              WHY <span className="text-purple-500">BRANDS</span> CHOOSE MOD
            </h2>

            <div className="flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-lg">
              {/* Left — dark */}
              <div className="flex-1 bg-[#111] text-white p-10 space-y-7">
                {[
                  {
                    title: "IP Protection",
                    body: "Every submission goes through structured review powered by AI-assisted screening and brand guideline checks. You maintain full approval control while benefiting from automation that helps manage submissions at scale.",
                  },
                  {
                    title: "New Revenue Streams",
                    body: "Licensed fan merchandise creates incremental revenue without building a new internal program from scratch.",
                  },
                  {
                    title: "Fan Engagement That Scales",
                    body: "Campaign-based submissions give fans a clear place to participate, without overwhelming your team.",
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

              {/* Right — purple gradient with logo */}
              <div className="w-full md:w-[280px] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center p-10">
                <span className="text-5xl font-black text-black tracking-widest select-none">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mod-logo-dark-gTZuJePnecraDwGyMlBCHe6E6xJgsx.png"
                    alt="MOD Logo"
                    width={260}
                    height={88}
                    className="h-18 w-auto"
                    priority
                />
                </span>
              </div>
            </div>

            <p className="mt-8 text-center text-sm font-semibold text-gray-800">
              MOD turns unmanaged fan activity into something
              <br />
              structured, reviewable, and brand-safe.
            </p>
          </div>
        </section>

        {/* ══════════════════════ TYPICAL CAMPAIGN ════════════════════════ */}
        <section className="bg-white py-16 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              A TYPICAL <span className="text-purple-500">CAMPAIGN</span> ON MOD
            </h2>

            {/* 4 steps with arrows */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3">
              {[
                { icon: <Megaphone size={28} className="text-purple-500" />, text: "A brand launches a fan art campaign with clear guidelines." },
                { icon: <MapPin size={28} className="text-purple-500" />, text: "Artists submit designs inspired by the IP." },
                { icon: <BadgeCheck size={28} className="text-purple-500" />, text: "Submissions are reviewed and approved by the brand." },
                { icon: <Scroll size={28} className="text-purple-500" />, text: "Selected artwork becomes officially licensed merchandise." },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-2xl p-6 w-[175px] text-center flex flex-col items-center gap-3 shadow-sm">
                    {icon}
                    <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
                  </div>
                  {i < 3 && (
                    <span className="text-gray-400 text-xl font-bold hidden md:block">→</span>
                  )}
                </div>
              ))}
            </div>

            {/* Checkmarks */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {["Fans feel recognized.", "Artists earn royalties.", "Brands stay in control."].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle2 size={15} className="text-purple-500" /> {t}
                </div>
              ))}
            </div>

            <p className="mt-6 text-xl font-bold">No chaos. No gray areas.</p>
          </div>
        </section>

        {/* ══════════════════════ READY CTA ════════════════════════ */}
        <section className="bg-white py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-black text-white text-center py-16 px-8">
              {/* purple glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-40 bg-purple-600 blur-[80px] opacity-60 rounded-full" />
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                  READY TO LAUNCH
                  <br />
                  A CAMPAIGN?
                </h2>
                <p className="mt-5 text-sm text-gray-300 max-w-xl mx-auto">
                  If your fandom is already creating around your IP, the opportunity already exists.
                  MOD helps you activate it safely, legally, and on your terms.
                </p>
                <p className="mt-5 font-bold tracking-widest text-sm">LAUNCH A CAMPAIGN</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700 rounded-full px-8 flex items-center gap-2 mx-auto">
                  <CalendarCheck size={15} /> Book a Demo
                </Button>
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
                question: "How does MOD protect our intellectual property?",
                answer: "Every submission is screened against your brand guidelines using MOD's AI-powered review system. Nothing moves forward without your explicit approval, ensuring full IP control at every step.",
              },
              {
                question: "What licensing options are available?",
                answer: "MOD supports flexible licensing structures. You define usage rights, royalty terms, and territory scope for each approved design before it goes to production.",
              },
              {
                question: "How are royalties tracked and distributed?",
                answer: "Sales data is tracked transparently through the platform. Royalties are calculated automatically and distributed to artists on a defined schedule, with full visibility for your team.",
              },
              {
                question: "Can MOD integrate with our existing systems?",
                answer: "MOD offers API access and integrations with common brand management and e-commerce platforms. Contact our team to discuss your specific technical requirements.",
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

      </main>
  );
}
