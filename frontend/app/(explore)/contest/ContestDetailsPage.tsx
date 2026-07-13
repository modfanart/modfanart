'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/AuthContext';
import { loginWithReturnTo } from '@/lib/auth/redirect';
import type { ContestData } from './contest.types';

export interface LegalPoint {
  label: string;
  text: string;
}

export interface ContestDetailPageProps {
  contest: ContestData;
  gallery?: string[];
  drawInspiration?: string[];
  stylesWelcome?: string[];
  legalPoints?: LegalPoint[];
  submissionSlot?: React.ReactNode;
}

const pad = (n: number) => String(n).padStart(2, '0');

interface CountdownState {
  done: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function calc(target: number): CountdownState {
  const diff = target - Date.now();
  if (diff <= 0 || Number.isNaN(target)) {
    return { done: true, days: '00', hours: '00', minutes: '00', seconds: '00' };
  }
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    days: pad(Math.floor(s / 86400)),
    hours: pad(Math.floor((s % 86400) / 3600)),
    minutes: pad(Math.floor((s % 3600) / 60)),
    seconds: pad(s % 60),
  };
}

function useCountdown(target: number): CountdownState {
  const [t, setT] = useState<CountdownState>({
    done: false, days: '00', hours: '00', minutes: '00', seconds: '00',
  });
  useEffect(() => {
    const tick = () => setT(calc(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function parseList(src: string | null | undefined, label: string): string[] {
  if (!src) return [];
  const i = src.indexOf(label);
  let body = (i === -1 ? src : src.slice(i + label.length)).trim();
  const dot = body.indexOf('. ');
  if (dot !== -1) body = body.slice(0, dot);
  return body.replace(/\.$/, '').split(',').map((x) => x.trim()).filter(Boolean);
}

function firstMoney(contest: ContestData): string {
  const snap = contest.submissionSnapshot.find((x) => x.includes('$'));
  const m = snap?.match(/\$[\d,]+(?:\s?USD)?/i);
  if (m) return m[0] ?? '';
  const m2 = contest.prizes[0]?.amount?.match(/\$[\d,]+/);
  return m2?.[0] ?? '';
}

function deriveLegalPoints(legal: ContestData['legal']): LegalPoint[] {
  const strip = (s: string, prefix: string) =>
    s.startsWith(prefix + ':') ? s.slice(prefix.length + 1).trim() : s;
  const out: LegalPoint[] = [];
  if (legal.ageRequirement) out.push({ label: 'Eligibility', text: strip(legal.ageRequirement, 'Eligibility') });
  if (legal.rightsGranted) out.push({ label: 'Limited promo license', text: strip(legal.rightsGranted, 'Limited promo license') });
  if (legal.licenseType) out.push({ label: 'Winner agreement', text: strip(legal.licenseType, 'Winner agreement') });
  if (legal.aiPolicy) out.push({ label: 'AI policy', text: legal.aiPolicy });
  if (legal.territory) out.push({ label: 'Territory', text: legal.territory });
  return out;
}

function CastCarousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  const hover = useRef(false);
  const n = images.length;
  const go = (idx: number) => setI(((idx % n) + n) % n);

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => { if (!hover.current) setI((p) => (p + 1) % n); }, 4500);
    return () => clearInterval(id);
  }, [n]);

  return (
    <div className="lib-carousel" onMouseEnter={() => (hover.current = true)} onMouseLeave={() => (hover.current = false)}>
      <button className="lib-nav lib-prev" type="button" aria-label="Previous image" onClick={() => go(i - 1)}>‹</button>
      <div className="lib-viewport" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}>
        <div className="lib-track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((src, idx) => (
            <div className="lib-slide" key={idx} role="group" aria-roledescription="slide" aria-label={`${idx + 1} of ${n}`}>
              <img loading="lazy" alt="Contest inspiration imagery" src={src}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
            </div>
          ))}
        </div>
      </div>
      <button className="lib-nav lib-next" type="button" aria-label="Next image" onClick={() => go(i + 1)}>›</button>
      <div className="lib-dots" aria-label="Carousel pagination">
        {images.map((_, idx) => (
          <button key={idx} type="button" className={`lib-dot ${i === idx ? 'is-active' : ''}`}
            aria-label={`Go to slide ${idx + 1}`} onClick={() => go(idx)} />
        ))}
      </div>
    </div>
  );
}

interface AccRowProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
function AccRow({ id, icon, title, open, onToggle, children }: AccRowProps) {
  return (
    <>
      <button className="modfd__accHeader" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className="modfd__accIcon">{icon}</span>
        <span className="modfd__accTitle">{title}</span>
        <span className="modfd__accChevron" aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
      </button>
      <div className={`modfd__accBody ${open ? 'is-open' : ''}`} id={id} role="region">{children}</div>
    </>
  );
}

function FullDetails({ contest, legalPoints }: { contest: ContestData; legalPoints: LegalPoint[] }) {
  const TABS: [string, string][] = [
    ['overview', 'Overview'], ['how', 'How It Works'], ['prizes', 'Prizes'],
    ['timeline', 'Timeline'], ['rules', 'Rules'], ['specs', 'Submission Specs'], ['legal', 'Legal'],
  ];
  const [tab, setTab] = useState('overview');
  const [open, setOpen] = useState<Record<string, boolean>>({ 'time-1': true, 'spec-2': true });
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const s = contest.requirements.specs;
  const fileQuality = ['Accepted formats: ' + s.fileFormats, ...s.minResolution.split('. ')];
  const payout = [contest.prizes[0]?.amount, ...(contest.prizes[0]?.description.split('. ').slice(0, 2) ?? [])].filter(Boolean) as string[];

  return (
    <div id="mod-full-details" className="modfd">
      <div className="modfd__wrap">
        <h2 className="modfd__title">FULL DETAILS AND GUIDELINES</h2>
        <p className="modfd__subtitle">{contest.overviewParagraphs[3] ?? ''}</p>

        <div className="modfd__tabs" role="tablist" aria-label="Full details and guidelines tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`modfd__tab ${tab === id ? 'is-active' : ''}`} role="tab"
              aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div className={`modfd__panel ${tab === 'overview' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">Quick reference</h3>
            <p className="modfd__muted">{contest.overviewParagraphs[2] ?? ''}<br /><br /><strong>Eligibility:</strong> {contest.eligibilityLabel}</p>
            <div className="modfd__grid3">
              <div className="modfd__miniCard modfd__miniCard--green">
                <div className="modfd__pill modfd__pill--green">ALLOWED</div>
                <ul className="modfd__list">{contest.requirements.allowed.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
              <div className="modfd__miniCard modfd__miniCard--red">
                <div className="modfd__pill modfd__pill--red">NOT ALLOWED</div>
                <ul className="modfd__list">{contest.requirements.notAllowed.map((x, i) => <li key={i}>{x.replace(/^No /, '')}</li>)}</ul>
              </div>
              <div className="modfd__miniCard modfd__miniCard--amber">
                <div className="modfd__pill modfd__pill--amber">CHECK FIRST</div>
                <ul className="modfd__list">{contest.requirements.remember.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'how' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">How it works</h3>
            <p className="modfd__muted">Five steps from your artwork to official merch.</p>
            <div className="modfd__accordion">
              {(contest.howItWorks ?? []).map((st) => (
                <AccRow key={st.step} id={`how-${st.step}`} icon={st.step} title={st.title}
                  open={!!open[`how-${st.step}`]} onToggle={() => toggle(`how-${st.step}`)}>{st.description}</AccRow>
              ))}
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'prizes' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">Prizes and compensation</h3>
            <p className="modfd__muted">Clear, simple, and paid.</p>
            <div className="modfd__grid2">
              <div className="modfd__box">
                <h4 className="modfd__boxTitle">WINNERS</h4>
                <ul className="modfd__list">{contest.commercialIntent.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
              <div className="modfd__box">
                <h4 className="modfd__boxTitle">PAYOUT</h4>
                <ul className="modfd__list">{payout.map((x, i) => <li key={i}>{x.replace(/\.$/, '')}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'timeline' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">Timeline</h3>
            <p className="modfd__muted">Key dates for this contest.</p>
            <div className="modfd__accordion">
              <AccRow id="time-1" icon="📅" title="Dates" open={!!open['time-1']} onToggle={() => toggle('time-1')}>
                <ul className="modfd__list">{contest.timeline.map((tl, i) => <li key={i}><strong>{tl.label}:</strong> {tl.date}</li>)}</ul>
              </AccRow>
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'rules' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">Contest rules</h3>
            <p className="modfd__muted">Summary rules to keep everything clean, fair, and licensable.</p>
            <div className="modfd__accordion">
              <AccRow id="rules-1" icon="✅" title="Must be true" open={!!open['rules-1']} onToggle={() => toggle('rules-1')}>
                <ul className="modfd__list">{contest.submissionChecklist.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </AccRow>
              <AccRow id="rules-2" icon="⛔" title="Not allowed" open={!!open['rules-2']} onToggle={() => toggle('rules-2')}>
                <ul className="modfd__list">{contest.requirements.notAllowed.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </AccRow>
              <AccRow id="rules-3" icon="🎯" title="What we want you to make" open={!!open['rules-3']} onToggle={() => toggle('rules-3')}>
                <p className="modfd__muted" style={{ margin: '0 0 10px 0' }}>{contest.brief.referenceNotes}</p>
              </AccRow>
              <AccRow id="rules-4" icon="👤" title="Age requirement" open={!!open['rules-4']} onToggle={() => toggle('rules-4')}>
                {contest.eligibilityLabel}
              </AccRow>
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'specs' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">Submission specs</h3>
            <p className="modfd__muted">Make it easy to review and easy to print.</p>
            <div className="modfd__accordion">
              <AccRow id="spec-1" icon="🖼️" title="File format and quality" open={!!open['spec-1']} onToggle={() => toggle('spec-1')}>
                <ul className="modfd__list">{fileQuality.map((x, i) => <li key={i}>{x.replace(/\.$/, '')}</li>)}</ul>
              </AccRow>
              <AccRow id="spec-2" icon="👕" title="Print size guidance" open={!!open['spec-2']} onToggle={() => toggle('spec-2')}>
                <p className="modfd__muted" style={{ margin: '0 0 12px 0' }}>{s.printArea}</p>
                {s.printGuideImageUrl && (
                  <div className="modfd__imgCard" aria-label="Print size diagram">
                    <img src={s.printGuideImageUrl} alt="Print size guidance" loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </AccRow>
              <AccRow id="spec-3" icon="✍️" title="Description" open={!!open['spec-3']} onToggle={() => toggle('spec-3')}>
                {s.requiredFields}
              </AccRow>
            </div>
          </div>
        </div>

        <div className={`modfd__panel ${tab === 'legal' ? 'is-active' : ''}`} role="tabpanel">
          <div className="modfd__card">
            <h3 className="modfd__cardTitle">LEGAL</h3>
            <p className="modfd__muted">Key points. Full terms are available at the link below.</p>
            <div className="modfd__legalBox">
              <ul className="modfd__legalList">
                {legalPoints.map((p, i) => <li key={i}><strong>{p.label}:</strong> {p.text}</li>)}
              </ul>
              <div className="modfd__legalCta">
                <a className="modfd__btn" href={contest.legal.termsUrl} target="_blank" rel="noopener noreferrer">Legal Terms and Conditions</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Faq({ items }: { items: ContestData['faq'] }) {
  const [open, setOpen] = useState(-1);
  return (
    <section className="mod-faq" aria-label="Frequently Asked Questions">
      <h2 className="mod-faq__title">Frequently Asked Questions</h2>
      <p className="mod-faq__intro">Quick answers for this contest.</p>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <details key={i} open={isOpen}>
            <summary onClick={(e) => { e.preventDefault(); setOpen(isOpen ? -1 : i); }}>
              {f.question}
              <span className="mod-faq__icon">+</span>
            </summary>
            <div className="mod-faq__content"><p>{f.answer}</p></div>
          </details>
        );
      })}
    </section>
  );
}

export default function ContestDetailPage({
  contest, gallery, drawInspiration, stylesWelcome, legalPoints, submissionSlot,
}: ContestDetailPageProps) {
  const target = useMemo(() => new Date(contest.submissionDeadlineIso).getTime(), [contest.submissionDeadlineIso]);
  const t = useCountdown(target);
  const money = firstMoney(contest);

  const { user } = useAuth();
  const isOpen = ['open', 'live', 'published'].includes(contest.status) && !t.done;
  const isClosed = !isOpen;
  const submissionHref = contest.submitUrl ?? `/submissions/new?contest=${contest.id}`;
  const submitHref = user ? submissionHref : `/signup?redirect=${encodeURIComponent(submissionHref)}`;

  // Gate submission on auth: signed-out visitors go to login and return here
  // after signing in; signed-in visitors go straight to the submission flow.
  // The page itself stays public (shareable / indexable) — only the action is gated.
  const { user, loading: authLoading } = useAuth();
  const submitTarget = user ? submitHref : loginWithReturnTo(submitHref);

  const images = gallery
    ?? (contest.brief.referenceImages.length ? contest.brief.referenceImages.map((r) => r.url) : []);
  const heroFallback = images.length ? images : (contest.heroImageUrl ? [contest.heroImageUrl] : []);

  const inspiration = drawInspiration ?? parseList(contest.brief.theme, 'Draw inspiration from:');
  const styles = stylesWelcome ?? parseList(contest.brief.styleDirection, 'Styles welcome:');
  const legal = legalPoints ?? deriveLegalPoints(contest.legal);
  const leadSentence = (contest.brief.theme.split('Draw inspiration from:')[0] ?? contest.brief.theme).trim();

  return (
    <div className="mfa">
      <style>{CSS}</style>

      <section className="hero">
        {contest.heroVideoUrl ? (
          <video className="hero__media" autoPlay muted loop playsInline poster={contest.heroImageUrl}
            onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}>
            <source src={contest.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          contest.heroImageUrl && <img className="hero__media" src={contest.heroImageUrl} alt="" />
        )}
        <div className="hero__scrim" />
        <div className="hero__text"><h2 className="hero__title">{contest.title}</h2></div>
      </section>

      <div className="page-width">
        <section className="mod-contest-box" aria-label={`${contest.brand.name} contest details`}>
          <div className="mod-contest-box__inner">
            <div className="mod-contest-box__header">
              <h2 className="mod-contest-box__title">{contest.tagline}</h2>
              <p className="mod-contest-box__lead">{contest.overviewParagraphs[0] ?? ''}</p>
              <p className="mod-contest-box__sub">{contest.overviewParagraphs[1] ?? ''}</p>
            </div>
            <div className="mod-contest-box__grid">
              <div className="mod-contest-box__highlight">
                <div className="mod-contest-box__metric">{contest.winnersCount}</div>
                <div className="mod-contest-box__metric-label">artists selected</div>
              </div>
              <div className="mod-contest-box__highlight">
                <div className="mod-contest-box__metric">{money}</div>
                <div className="mod-contest-box__metric-label">cash prize per winner</div>
              </div>
              <div className="mod-contest-box__bullets">
                <div className="mod-contest-box__kicker">What You Get</div>
                <ul className="mod-contest-box__list">{contest.prizeSummary.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="lib-contest-wrap" aria-label="Contest inspiration">
        {heroFallback.length > 0 && <CastCarousel images={heroFallback} />}
        <div className="lib-copy">
          <h2 className="lib-h2">WHAT TO SUBMIT</h2>
          <p className="lib-sub">{leadSentence}</p>
          <div className="lib-cards">
            <div className="lib-card">
              <h3>DRAW INSPIRATION FROM</h3>
              {inspiration.length
                ? <ul>{inspiration.map((x, i) => <li key={i}>{x}</li>)}</ul>
                : <p>{contest.brief.theme}</p>}
            </div>
            <div className="lib-card">
              <h3>STYLES WELCOME</h3>
              {styles.length
                ? <ul>{styles.map((x, i) => <li key={i}>{x}</li>)}</ul>
                : <p>{contest.brief.styleDirection}</p>}
            </div>
          </div>
          <p className="lib-footer">{contest.inspirationNote}</p>
        </div>
      </section>

      <div className="page-width"><FullDetails contest={contest} legalPoints={legal} /></div>

      <div className="mod-countdown" aria-label="Submission deadline countdown">
        <div className="mod-countdown__wrap">
          <h3 className="mod-countdown__title">Submission Deadline</h3>
          <p className="mod-countdown__subtitle">Entries close on <strong>{contest.submissionDeadlineDisplay}</strong>. Get your design in before time runs out.</p>
          {!t.done ? (
            <div className="mod-countdown__timer" role="group" aria-label="Countdown timer">
              {([['Days', t.days], ['Hours', t.hours], ['Minutes', t.minutes], ['Seconds', t.seconds]] as [string, string][]).map(([l, v]) => (
                <div className="mod-countdown__box" key={l}>
                  <div className="mod-countdown__num">{v}</div>
                  <div className="mod-countdown__label">{l}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mod-countdown__done">Submissions are now closed.</div>
          )}
        </div>
      </div>

      <div className="mod-countdown" aria-label="Submission form">
        {submissionSlot ?? (
          <div className="mod-countdown__wrap" style={{ textAlign: 'center', padding: '40px 24px' }}>
            {isClosed ? (
              <Button disabled size="lg" className="esf-submit-btn esf-submit-btn--closed w-full max-w-md h-14 text-lg">
                Submissions Closed
              </Button>
            ) : authLoading ? (
              // Auth still resolving — keep the CTA inert so a signed-in visitor
              // isn't briefly routed to login during the rehydration window.
              <Button disabled size="lg" className="esf-submit-btn w-full max-w-md h-14 text-lg">
                Submit Your Artwork
              </Button>
            ) : (
              <Button asChild size="lg" className="esf-submit-btn w-full max-w-md h-14 text-lg">
                <Link href={submitTarget}>
                  Submit Your Artwork
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            )}
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,.7)' }}>
              {isClosed
                ? 'The submission period has ended.'
                : !authLoading && !user
                  ? 'Log in to submit your artwork'
                  : 'Submission will open in your dashboard'}
            </p>
          </div>
        )}
      </div>

      <div className="page-width"><Faq items={contest.faq} /></div>
    </div>
  );
}

const CSS = `
.mfa{ background:#fff; color:#111; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height:1.6; }
.mfa *{ box-sizing:border-box; }
.mfa .page-width{ max-width:1200px; margin:0 auto; padding:0 18px; }
.mfa .hero{ position:relative; min-height:550px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#0b0f19; }
.mfa .hero__media{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.mfa .hero__scrim{ position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.55)); }
.mfa .hero__text{ position:relative; padding:24px; text-align:center; }
.mfa .hero__title{ margin:0; color:#fff; text-transform:uppercase; font-weight:900; letter-spacing:.01em; line-height:1.04; font-size:40px; text-shadow:0 4px 30px rgba(0,0,0,.6); max-width:16ch; }
@media (min-width:769px){ .mfa .hero__title{ font-size:80px; } }
.mfa .mod-contest-box{ --bg:#0b0f19; --panel:rgba(255,255,255,.06); --border:rgba(255,255,255,.14); --text:rgba(255,255,255,.92); --muted:rgba(255,255,255,.72);
  width:100%; margin:36px 0; background:radial-gradient(1200px 600px at 10% 0%, rgba(255,204,0,.16), transparent 55%), radial-gradient(900px 500px at 90% 20%, rgba(80,140,255,.16), transparent 60%), var(--bg);
  border:1px solid var(--border); border-radius:18px; padding:45px; box-shadow:0 18px 50px rgba(0,0,0,.38); }
.mfa .mod-contest-box__inner{ max-width:1100px; margin:0 auto; }
.mfa .mod-contest-box__title{ margin:0 0 14px; color:var(--text); text-transform:uppercase; letter-spacing:.06em; font-weight:900; line-height:1.05; font-size:clamp(24px,3vw,38px); }
.mfa .mod-contest-box__lead{ margin:0 0 12px; color:var(--muted); font-size:clamp(14px,1.35vw,18px); line-height:1.55; }
.mfa .mod-contest-box__sub{ margin:0; color:var(--text); font-size:clamp(14px,1.25vw,17px); font-weight:700; opacity:.95; }
.mfa .mod-contest-box__grid{ margin-top:18px; display:grid; grid-template-columns:1fr 1fr 2fr; gap:14px; align-items:stretch; }
.mfa .mod-contest-box__highlight, .mfa .mod-contest-box__bullets{ background:var(--panel); border:1px solid var(--border); border-radius:16px; padding:16px; }
.mfa .mod-contest-box__metric{ color:var(--text); font-weight:900; letter-spacing:-.02em; font-size:clamp(26px,3vw,42px); line-height:1; }
.mfa .mod-contest-box__metric-label{ margin-top:8px; color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:.08em; font-weight:700; }
.mfa .mod-contest-box__kicker{ color:var(--text); font-weight:900; letter-spacing:.06em; text-transform:uppercase; font-size:13px; margin-bottom:10px; }
.mfa .mod-contest-box__list{ margin:0; padding-left:18px; color:var(--muted); line-height:1.5; font-size:15px; }
.mfa .mod-contest-box__list li{ margin:8px 0; }
@media (max-width:900px){ .mfa .mod-contest-box{ padding:18px; } .mfa .mod-contest-box__grid{ grid-template-columns:1fr; } }
.mfa .lib-contest-wrap{ width:100%; max-width:1200px; margin:0 auto; padding:22px 18px 8px; color:#111; }
.mfa .lib-carousel{ position:relative; border-radius:22px; background:#f7f5ee; overflow:hidden; box-shadow:0 18px 50px rgba(0,0,0,.10); }
.mfa .lib-viewport{ width:100%; height:460px; overflow:hidden; outline:none; }
.mfa .lib-track{ display:flex; height:100%; will-change:transform; transition:transform 420ms cubic-bezier(.2,.8,.2,1); }
.mfa .lib-slide{ flex:0 0 100%; height:100%; position:relative; user-select:none; }
.mfa .lib-slide img{ width:100%; height:100%; display:block; object-fit:cover; object-position:center 18%; background:#f7f5ee; }
.mfa .lib-nav{ position:absolute; top:50%; transform:translateY(-50%); width:54px; height:54px; border-radius:999px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:30px; line-height:1; color:#fff; background:rgba(0,0,0,.45); backdrop-filter:blur(6px); box-shadow:0 18px 40px rgba(0,0,0,.18); z-index:3; transition:background .2s ease, transform .2s ease; }
.mfa .lib-nav:hover{ background:rgba(0,0,0,.55); }
.mfa .lib-prev{ left:18px; } .mfa .lib-next{ right:18px; }
.mfa .lib-dots{ position:absolute; left:50%; bottom:12px; transform:translateX(-50%); display:flex; gap:8px; padding:8px 10px; border-radius:999px; background:rgba(255,255,255,.72); backdrop-filter:blur(8px); box-shadow:0 10px 30px rgba(0,0,0,.10); z-index:3; }
.mfa .lib-dot{ width:22px; height:8px; border-radius:999px; border:none; cursor:pointer; background:rgba(0,0,0,.20); transition:width .25s ease, background .25s ease; opacity:.9; }
.mfa .lib-dot.is-active{ width:38px; background:rgba(0,0,0,.75); opacity:1; }
.mfa .lib-copy{ margin:26px auto 6px; text-align:center; }
.mfa .lib-h2{ margin:0 0 10px; font-weight:900; letter-spacing:.04em; font-size:52px; }
.mfa .lib-sub{ margin:0 auto 22px; max-width:900px; font-size:20px; line-height:1.55; color:#333; }
.mfa .lib-cards{ margin:12px auto 14px; display:grid; grid-template-columns:1fr 1fr; gap:28px; max-width:1080px; padding:0 6px; }
.mfa .lib-card{ text-align:left; background:#fff; border-radius:20px; padding:22px 26px; box-shadow:0 18px 46px rgba(0,0,0,.12), 0 1px 0 rgba(0,0,0,.06); border:1px solid rgba(0,0,0,.06); }
.mfa .lib-card h3{ margin:0 0 14px; font-size:28px; letter-spacing:.02em; font-weight:900; }
.mfa .lib-card ul{ margin:0; padding-left:22px; font-size:20px; line-height:1.95; color:#222; }
.mfa .lib-card p{ margin:0; font-size:18px; line-height:1.6; color:#333; }
.mfa .lib-footer{ margin:20px 0 0; font-size:22px; color:#555; font-weight:600; }
@media (max-width:980px){ .mfa .lib-viewport{ height:360px; } .mfa .lib-h2{ font-size:42px; } .mfa .lib-sub{ font-size:18px; } .mfa .lib-card h3{ font-size:22px; } .mfa .lib-card ul{ font-size:18px; } .mfa .lib-footer{ font-size:18px; } }
@media (max-width:760px){ .mfa .lib-cards{ grid-template-columns:1fr; gap:18px; } .mfa .lib-card{ padding:20px; } .mfa .lib-nav{ width:48px; height:48px; font-size:28px; } .mfa .lib-prev{ left:12px; } .mfa .lib-next{ right:12px; } }
.mfa #mod-full-details.modfd{ font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:#121212; }
.mfa #mod-full-details .modfd__wrap{ max-width:1200px; margin:0 auto; padding:28px 0; }
.mfa #mod-full-details .modfd__title{ font-size:44px; line-height:1.05; margin:0 0 10px; letter-spacing:.5px; font-weight:900; text-transform:uppercase; }
.mfa #mod-full-details .modfd__subtitle{ margin:0 0 22px; color:#555; font-size:18px; line-height:1.55; max-width:980px; }
.mfa #mod-full-details .modfd__tabs{ display:flex; gap:10px; flex-wrap:wrap; background:#f4f4f5; border:1px solid #e7e7ea; border-radius:18px; padding:10px; margin:18px 0 16px; box-shadow:0 8px 28px rgba(0,0,0,.04); }
.mfa #mod-full-details .modfd__tab{ appearance:none; border:1px solid transparent; background:transparent; color:#666; font-weight:700; font-size:16px; padding:12px 16px; border-radius:999px; cursor:pointer; transition:all .15s ease; }
.mfa #mod-full-details .modfd__tab:hover{ background:#fff; border-color:#e7e7ea; color:#222; }
.mfa #mod-full-details .modfd__tab.is-active{ background:#fff; border-color:#e7e7ea; color:#111; box-shadow:0 10px 22px rgba(0,0,0,.06); }
.mfa #mod-full-details .modfd__panel{ display:none; }
.mfa #mod-full-details .modfd__panel.is-active{ display:block; }
.mfa #mod-full-details .modfd__card{ background:#fff; border:1px solid #e7e7ea; border-radius:22px; padding:22px; box-shadow:0 18px 50px rgba(0,0,0,.06); }
.mfa #mod-full-details .modfd__cardTitle{ margin:0 0 6px; font-size:28px; font-weight:900; letter-spacing:.2px; }
.mfa #mod-full-details .modfd__muted{ margin:0 0 16px; color:#666; font-size:16px; line-height:1.6; }
.mfa #mod-full-details .modfd__grid3{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-top:14px; }
.mfa #mod-full-details .modfd__grid2{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:14px; }
.mfa #mod-full-details .modfd__miniCard{ border-radius:18px; border:1px solid #e7e7ea; background:#fbfbfc; padding:16px; box-shadow:0 14px 30px rgba(0,0,0,.06); }
.mfa #mod-full-details .modfd__miniCard--green{ border-color:#bfe8cf; background:#f3fbf6; }
.mfa #mod-full-details .modfd__miniCard--red{ border-color:#f3b7b7; background:#fff4f4; }
.mfa #mod-full-details .modfd__miniCard--amber{ border-color:#f1d49a; background:#fff9ef; }
.mfa #mod-full-details .modfd__pill{ display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; font-weight:900; font-size:13px; letter-spacing:.6px; margin-bottom:10px; border:1px solid #e7e7ea; background:#fff; }
.mfa #mod-full-details .modfd__pill--green{ border-color:#bfe8cf; color:#1e6b3d; background:#eaf7ef; }
.mfa #mod-full-details .modfd__pill--red{ border-color:#f3b7b7; color:#a92a2a; background:#ffeaea; }
.mfa #mod-full-details .modfd__pill--amber{ border-color:#f1d49a; color:#8a5a07; background:#fff2d9; }
.mfa #mod-full-details .modfd__box{ border-radius:18px; border:1px solid #e7e7ea; background:#fbfbfc; padding:16px; box-shadow:0 14px 30px rgba(0,0,0,.06); }
.mfa #mod-full-details .modfd__boxTitle{ margin:0 0 10px; font-weight:900; letter-spacing:.5px; font-size:18px; }
.mfa #mod-full-details .modfd__list{ margin:0; padding-left:18px; color:#333; line-height:1.7; font-size:15.5px; }
.mfa #mod-full-details .modfd__list li{ margin:6px 0; }
.mfa #mod-full-details .modfd__accordion{ display:flex; flex-direction:column; gap:12px; margin-top:14px; }
.mfa #mod-full-details .modfd__accHeader{ width:100%; border:1px solid #e7e7ea; background:#fff; border-radius:18px; padding:14px; cursor:pointer; display:grid; grid-template-columns:52px 1fr 40px; gap:12px; align-items:center; box-shadow:0 12px 26px rgba(0,0,0,.05); transition:transform .12s ease, box-shadow .12s ease; }
.mfa #mod-full-details .modfd__accHeader:hover{ transform:translateY(-1px); box-shadow:0 16px 34px rgba(0,0,0,.07); }
.mfa #mod-full-details .modfd__accIcon{ width:44px; height:44px; border-radius:14px; background:#f2f2f4; border:1px solid #e7e7ea; display:flex; align-items:center; justify-content:center; font-weight:900; color:#111; font-size:16px; }
.mfa #mod-full-details .modfd__accTitle{ text-align:left; font-size:18px; font-weight:900; color:#111; }
.mfa #mod-full-details .modfd__accChevron{ width:40px; height:40px; border-radius:999px; background:#f2f2f4; border:1px solid #e7e7ea; display:flex; align-items:center; justify-content:center; font-size:18px; color:#111; transition:transform .15s ease; }
.mfa #mod-full-details .modfd__accBody{ display:none; border:1px solid #e7e7ea; background:#fff; border-radius:18px; padding:14px 16px; margin-top:-6px; box-shadow:0 12px 26px rgba(0,0,0,.05); color:#333; line-height:1.7; font-size:15.5px; }
.mfa #mod-full-details .modfd__accBody.is-open{ display:block; }
.mfa #mod-full-details .modfd__imgCard{ border-radius:18px; border:1px solid #e7e7ea; background:#f8f8fa; padding:14px; box-shadow:0 12px 26px rgba(0,0,0,.05); }
.mfa #mod-full-details .modfd__imgCard img{ width:100%; height:auto; display:block; border-radius:14px; }
.mfa #mod-full-details .modfd__legalBox{ border-radius:18px; border:1px solid #e7e7ea; background:#fff; padding:16px; box-shadow:0 14px 30px rgba(0,0,0,.06); }
.mfa #mod-full-details .modfd__legalList{ margin:0; padding-left:18px; color:#333; line-height:1.75; font-size:15.5px; }
.mfa #mod-full-details .modfd__legalList li{ margin:10px 0; }
.mfa #mod-full-details .modfd__legalCta{ display:flex; justify-content:flex-end; margin-top:14px; }
.mfa #mod-full-details .modfd__btn{ display:inline-flex; align-items:center; justify-content:center; padding:14px 22px; border-radius:999px; background:#0f0f10; border:1px solid rgba(255,255,255,.12); font-weight:900; font-size:16px; text-decoration:none; box-shadow:0 18px 40px rgba(0,0,0,.18); color:#fff; transition:transform .12s ease, box-shadow .12s ease; }
.mfa #mod-full-details .modfd__btn:hover{ transform:translateY(-1px); box-shadow:0 22px 46px rgba(0,0,0,.22); color:#fff; }
@media (max-width:980px){ .mfa #mod-full-details .modfd__grid3{ grid-template-columns:1fr; } .mfa #mod-full-details .modfd__grid2{ grid-template-columns:1fr; } .mfa #mod-full-details .modfd__title{ font-size:34px; } }
.mfa .mod-countdown{ max-width:980px; margin:16px auto 20px; padding:0 16px; }
.mfa .mod-countdown__wrap{ background:linear-gradient(180deg,#0b0b0f,#141420); border:1px solid rgba(255,255,255,.10); border-radius:20px; padding:18px 20px 16px; box-shadow:0 10px 26px rgba(0,0,0,.22); color:#fff; }
.mfa .mod-countdown__title{ margin:0 0 6px; font-size:20px; letter-spacing:.3px; text-transform:uppercase; }
.mfa .mod-countdown__subtitle{ margin:0 0 14px; font-size:15px; color:rgba(255,255,255,.75); line-height:1.45; }
.mfa .mod-countdown__timer{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
.mfa .mod-countdown__box{ background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); border-radius:14px; padding:12px 8px 10px; text-align:center; }
.mfa .mod-countdown__num{ font-size:28px; font-weight:800; line-height:1; font-variant-numeric:tabular-nums; }
.mfa .mod-countdown__label{ margin-top:6px; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.65); }
.mfa .mod-countdown__done{ margin-top:12px; padding:10px 12px; border-radius:12px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); font-weight:600; color:#fff; }
@media (max-width:640px){ .mfa .mod-countdown__timer{ grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; } .mfa .mod-countdown__num{ font-size:26px; } }
.mfa .esf-submit-btn{ background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.18); color:#fff; margin:0 auto; transition:background .15s ease, border-color .15s ease; }
.mfa .esf-submit-btn:hover{ background:rgba(255,255,255,.16); border-color:rgba(255,255,255,.30); }
.mfa .esf-submit-btn--closed{ background:rgba(255,255,255,.06); color:rgba(255,255,255,.55); cursor:not-allowed; }
.mfa .esf-submit-btn--closed:hover{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.18); }
.mfa .mod-faq{ max-width:980px; margin:0 auto; padding:24px 0 56px; }
.mfa .mod-faq__title{ text-align:center; font-size:clamp(26px,4vw,36px); margin:0 0 18px; }
.mfa .mod-faq__intro{ text-align:center; color:#666; margin:0 0 28px; }
.mfa .mod-faq details{ border:1px solid rgba(0,0,0,.08); background:#fff; border-radius:14px; box-shadow:0 6px 18px rgba(0,0,0,.06); margin:10px 0; overflow:hidden; transition:box-shadow .2s ease, transform .08s ease; }
.mfa .mod-faq details[open]{ box-shadow:0 10px 24px rgba(0,0,0,.10); transform:translateY(-1px); }
.mfa .mod-faq summary{ list-style:none; cursor:pointer; padding:18px 22px; display:grid; grid-template-columns:1fr auto; align-items:center; gap:12px; font-weight:700; font-size:18px; }
.mfa .mod-faq summary::-webkit-details-marker{ display:none; }
.mfa .mod-faq__icon{ width:28px; height:28px; border-radius:50%; display:grid; place-items:center; border:1px solid rgba(0,0,0,.15); transition:transform .2s ease, background .2s ease; font-size:18px; line-height:1; }
.mfa .mod-faq details[open] .mod-faq__icon{ transform:rotate(45deg); background:#f5f5f5; }
.mfa .mod-faq__content{ padding:0 22px 18px; color:#333; font-size:16px; line-height:1.6; }
.mfa .mod-faq__content p{ margin:8px 0; }
.mfa :focus-visible{ outline:2px solid #09418b; outline-offset:2px; }
@media (prefers-reduced-motion:reduce){ .mfa *{ transition:none !important; } }
`;
