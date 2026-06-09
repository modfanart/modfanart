'use client';

import { useState } from 'react';
import type {
  ContestData,
  ContestStatus,
  Visibility,
  AIPolicy,
  ContestPrize,
  TimelineEntry,
  JudgingCriterion,
  FAQItem,
} from './contestTypes';

// ─── helpers ────────────────────────────────────────────────────────────────

function emptyContest(): Omit<ContestData, 'id'> {
  return {
    status: 'draft',
    visibility: 'public',
    brand: {
      name: '',
      logoInitial: '',
      logoUrl: null,
      accentColor: '#2563eb',
      bgColor: '#f4f6fb',
      surfaceColor: '#ffffff',
    },
    heroImageUrl: '',
    title: '',
    tagline: '',
    contestType: 'Fan Art Contest',
    region: 'Global',
    ageRequirement: '18+',
    submissionDeadlineDisplay: '',
    winnersCount: 1,
    prizeModel: 'Cash + Licensing',
    productFocus: '',
    startDateDisplay: '',
    submissionDeadlineIso: '',
    winnersAnnouncedDisplay: 'Shortly After Deadline',
    eligibilityLabel: 'Global, 18+',
    prizeSummary: { headline: '', bullets: [''] },
    submissionSnapshot: [''],
    commercialIntent: [''],
    overviewParagraphs: [''],
    brief: {
      guidelinesPdfUrl: null,
      theme: '',
      styleDirection: '',
      targetAudience: '',
      referenceNotes: '',
      referenceImages: [],
    },
    requirements: {
      allowed: [''],
      notAllowed: [''],
      remember: [''],
      specs: {
        fileFormats: 'PNG, PSD, AI, SVG',
        minResolution: '300 DPI / 4500 × 5400 px',
        requiredFields: 'Title, description, tags, process notes',
        mockupRequired: 'Optional',
      },
    },
    submissionRules: {
      maxEntriesPerArtist: 3,
      aiPolicy: 'disclosure_required',
      aiPolicyLabel: 'Disclose Usage',
    },
    products: { categories: [''], description: '' },
    prizes: [{ place: '1st Place', amount: '', description: '' }],
    licensingOpportunityNote: '',
    timeline: [
      { label: 'Submissions Open', date: '' },
      { label: 'Submission Deadline', date: '' },
      { label: 'Review Period', date: '' },
      { label: 'Winners Announced', date: '' },
      { label: 'Target Merch Launch', date: '' },
    ],
    judging: {
      criteria: [
        { title: 'Brand Fit', description: '' },
        { title: 'Originality', description: '' },
        { title: 'Commercial Appeal', description: '' },
        { title: 'Execution', description: '' },
      ],
      selectionType: 'Internal Brand and MOD Review',
      reviewTeam: 'Brand Team, MOD Licensing Team',
    },
    legal: {
      licenseType: 'Optional on selection',
      rightsGranted: '',
      territory: 'Global',
      aiPolicy: 'AI assisted only with disclosure',
      ageRequirement: '18+',
      termsUrl: '',
    },
    faq: [{ question: '', answer: '' }],
    submissionChecklist: [
      'Original artwork only',
      'Correct file format and resolution',
      'Title and description included',
      'AI disclosure if applicable',
      'Agree to submission terms',
    ],
    inspirationNote:
      'Review the creative brief, approved themes, and reference materials before submitting your concept.',
    submitUrl: '',
    termsUrl: '',
  };
}

const STEPS = [
  { id: 1, label: 'Basics' },
  { id: 2, label: 'Brief' },
  { id: 3, label: 'Requirements' },
  { id: 4, label: 'Products & Timeline' },
  { id: 5, label: 'Prizes' },
  { id: 6, label: 'Judging & Legal' },
  { id: 7, label: 'FAQ & Finish' },
];

// ─── array field helpers ─────────────────────────────────────────────────────

function ArrayField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="ncf-label">{label}</label>
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <input
            className="ncf-input"
            value={v}
            style={{ flex: 1 }}
            onChange={(e) => {
              const n = [...values];
              n[i] = e.target.value;
              onChange(n);
            }}
          />
          <button
            type="button"
            className="ncf-btn-ghost"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="ncf-btn-add" onClick={() => onChange([...values, ''])}>
        + Add item
      </button>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function NewContestForm() {
  const onSubmit = async (data: Omit<ContestData, 'id'>) => {
    // TODO: call your API here, e.g.:
    // await fetch('/api/contests', { method: 'POST', body: JSON.stringify(data) });
    console.log('Submitting contest:', data);
  };
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Omit<ContestData, 'id'>>(emptyContest());
  const [submitted, setSubmitted] = useState(false);

  function set<T>(path: string, value: T) {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!;
        obj[key] = { ...(obj[key] as object) };
        obj = obj[key] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]!] = value;
      return next;
    });
  }

  function field(
    label: string,
    path: string,
    opts?: { type?: string; placeholder?: string; textarea?: boolean; rows?: number }
  ) {
    const keys = path.split('.');
    let val: unknown = form as unknown;
    for (const k of keys) val = (val as Record<string, unknown>)[k];
    return (
      <div className="ncf-field">
        <label className="ncf-label">{label}</label>
        {opts?.textarea ? (
          <textarea
            className="ncf-input ncf-textarea"
            rows={opts.rows ?? 3}
            placeholder={opts?.placeholder}
            value={String(val ?? '')}
            onChange={(e) => set(path, e.target.value)}
          />
        ) : (
          <input
            className="ncf-input"
            type={opts?.type ?? 'text'}
            placeholder={opts?.placeholder}
            value={String(val ?? '')}
            onChange={(e) =>
              set(path, opts?.type === 'number' ? Number(e.target.value) : e.target.value)
            }
          />
        )}
      </div>
    );
  }

  function select(label: string, path: string, options: { value: string; label: string }[]) {
    const keys = path.split('.');
    let val: unknown = form as unknown;
    for (const k of keys) val = (val as Record<string, unknown>)[k];
    return (
      <div className="ncf-field">
        <label className="ncf-label">{label}</label>
        <select
          className="ncf-input ncf-select"
          value={String(val ?? '')}
          onChange={(e) => set(path, e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const prev = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(form);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="ncf-wrap">
        <style>{CSS}</style>
        <div className="ncf-success">
          <div className="ncf-success__icon">✓</div>
          <h2>Contest Created!</h2>
          <p>
            Your contest has been saved as a draft. You can preview and publish it from the
            dashboard.
          </p>
          <button
            className="ncf-btn-primary"
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setForm(emptyContest());
            }}
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ncf-wrap">
      <style>{CSS}</style>

      {/* Header */}
      <div className="ncf-header">
        <p className="ncf-header__eyebrow">MOD Fan Official</p>
        <h1>Launch a New Contest</h1>
        <p className="ncf-header__sub">
          Fill in the details below to create your fan-art campaign. You can save as a draft at any
          time.
        </p>
      </div>

      {/* Step nav */}
      <div className="ncf-steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`ncf-step ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}
            onClick={() => setStep(s.id)}
          >
            <span className="ncf-step__num">{step > s.id ? '✓' : s.id}</span>
            <span className="ncf-step__label">{s.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ncf-card">
          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 1</p>
                <h2>Campaign Basics</h2>
                <p>The core identity of your contest.</p>
              </div>
              <div className="ncf-grid-2">
                {field('Contest Title *', 'title', {
                  placeholder: 'Dark Legends Merch Design Contest',
                })}
                {field('Brand / IP Name *', 'brand.name', { placeholder: 'Dark Legends' })}
              </div>
              {field('Tagline / Short Description *', 'tagline', {
                textarea: true,
                rows: 2,
                placeholder: 'Create original artwork inspired by…',
              })}
              <div className="ncf-grid-2">
                {select('Contest Type', 'contestType', [
                  { value: 'Fan Art Contest', label: 'Fan Art Contest' },
                  { value: 'Design Challenge', label: 'Design Challenge' },
                  { value: 'Open Call', label: 'Open Call' },
                  { value: 'Licensing Activation', label: 'Licensing Activation' },
                ])}
                {select('Visibility', 'visibility', [
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' },
                  { value: 'invite_only', label: 'Invite Only' },
                ])}
              </div>
              <div className="ncf-grid-2">
                {select('Age Requirement', 'ageRequirement', [
                  { value: '18+', label: '18+' },
                  { value: 'All Ages', label: 'All Ages' },
                ])}
                {field('Region', 'region', { placeholder: 'Global' })}
              </div>
              <div className="ncf-grid-2">
                {field('Prize Model', 'prizeModel', { placeholder: 'Cash + Licensing' })}
                {field('Product Focus', 'productFocus', { placeholder: 'Apparel + Posters' })}
              </div>
              <div className="ncf-divider" />
              <p className="ncf-section-label">Branding</p>
              <div className="ncf-grid-2">
                {field('Brand Logo Initial', 'brand.logoInitial', { placeholder: 'D' })}
                {field('Logo Image URL', 'brand.logoUrl', { placeholder: 'https://…/logo.png' })}
              </div>
              <div className="ncf-grid-3">
                {field('Accent Color', 'brand.accentColor', { type: 'color' })}
                {field('Background Color', 'brand.bgColor', { type: 'color' })}
                {field('Surface Color', 'brand.surfaceColor', { type: 'color' })}
              </div>
              {field('Hero Image URL *', 'heroImageUrl', {
                placeholder: 'https://images.unsplash.com/…',
              })}
            </>
          )}

          {/* ── STEP 2: Brief ── */}
          {step === 2 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 2</p>
                <h2>Creative Brief</h2>
                <p>Give artists the direction they need to succeed.</p>
              </div>
              {field('Theme / Concept *', 'brief.theme', {
                textarea: true,
                rows: 2,
                placeholder: 'Dark fantasy iconography, ancient factions…',
              })}
              {field('Style Direction *', 'brief.styleDirection', {
                textarea: true,
                rows: 2,
                placeholder: 'Premium graphic apparel, bold composition…',
              })}
              {field('Target Audience *', 'brief.targetAudience', {
                textarea: true,
                rows: 2,
                placeholder: 'Core fandom collectors, fantasy genre fans…',
              })}
              {field('Reference Notes', 'brief.referenceNotes', {
                textarea: true,
                rows: 2,
                placeholder: 'Use official lore, approved symbols…',
              })}
              <div className="ncf-divider" />
              <p className="ncf-section-label">Brand Guidelines PDF (optional)</p>
              {field('Guidelines PDF URL', 'brief.guidelinesPdfUrl', {
                placeholder:
                  'https://…/brand-guidelines.pdf — leave blank to hide the download banner',
              })}
            </>
          )}

          {/* ── STEP 3: Requirements ── */}
          {step === 3 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 3</p>
                <h2>Requirements & Rules</h2>
                <p>Define what artists can and cannot do.</p>
              </div>
              <ArrayField
                label="✅ Allowed"
                values={form.requirements.allowed}
                onChange={(v) => set('requirements.allowed', v)}
              />
              <ArrayField
                label="🚫 Not Allowed"
                values={form.requirements.notAllowed}
                onChange={(v) => set('requirements.notAllowed', v)}
              />
              <ArrayField
                label="⚠️ Remember"
                values={form.requirements.remember}
                onChange={(v) => set('requirements.remember', v)}
              />
              <div className="ncf-divider" />
              <p className="ncf-section-label">File Specs</p>
              <div className="ncf-grid-2">
                {field('Allowed File Formats', 'requirements.specs.fileFormats', {
                  placeholder: 'PNG, PSD, AI, SVG',
                })}
                {field('Minimum Resolution', 'requirements.specs.minResolution', {
                  placeholder: '300 DPI / 4500 × 5400 px',
                })}
              </div>
              <div className="ncf-grid-2">
                {field('Required Submission Fields', 'requirements.specs.requiredFields', {
                  placeholder: 'Title, description, tags, process notes',
                })}
                {select('Mockup Required', 'requirements.specs.mockupRequired', [
                  { value: 'Optional', label: 'Optional' },
                  { value: 'Required', label: 'Required' },
                ])}
              </div>
              <div className="ncf-divider" />
              <p className="ncf-section-label">Submission Rules</p>
              <div className="ncf-grid-2">
                {field('Max Entries Per Artist', 'submissionRules.maxEntriesPerArtist', {
                  type: 'number',
                  placeholder: '3',
                })}
                {select('AI Policy', 'submissionRules.aiPolicy', [
                  { value: 'not_allowed', label: 'Not Allowed' },
                  { value: 'disclosure_required', label: 'Allowed With Disclosure' },
                  { value: 'allowed', label: 'Fully Allowed' },
                ])}
              </div>
              {field('AI Policy Display Label', 'submissionRules.aiPolicyLabel', {
                placeholder: 'Disclose Usage',
              })}
            </>
          )}

          {/* ── STEP 4: Products & Timeline ── */}
          {step === 4 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 4</p>
                <h2>Products & Timeline</h2>
                <p>Set the product scope and key dates.</p>
              </div>
              <ArrayField
                label="Product Categories"
                values={form.products.categories}
                onChange={(v) => set('products.categories', v)}
              />
              {field('Products Description', 'products.description', { textarea: true, rows: 2 })}
              <div className="ncf-divider" />
              <p className="ncf-section-label">Key Dates (displayed text)</p>
              <div className="ncf-grid-2">
                {field('Start Date Display', 'startDateDisplay', { placeholder: '17 March 2026' })}
                {field('Submission Deadline Display', 'submissionDeadlineDisplay', {
                  placeholder: '9 April 2026',
                })}
              </div>
              <div className="ncf-grid-2">
                {field('Submission Deadline (ISO for logic)', 'submissionDeadlineIso', {
                  type: 'date',
                })}
                {field('Winners Announced Label', 'winnersAnnouncedDisplay', {
                  placeholder: 'Shortly After Deadline',
                })}
              </div>
              {field('Eligibility Label', 'eligibilityLabel', { placeholder: 'Global, 18+' })}
              <div className="ncf-divider" />
              <p className="ncf-section-label">Timeline Rows</p>
              {form.timeline.map((row, i) => (
                <div key={i} className="ncf-grid-2" style={{ alignItems: 'flex-end' }}>
                  <div className="ncf-field">
                    <label className="ncf-label">Label</label>
                    <input
                      className="ncf-input"
                      value={row.label}
                      onChange={(e) => {
                        const t = [...form.timeline];
                        t[i] = { ...t[i], label: e.target.value } as TimelineEntry;
                        set('timeline', t);
                      }}
                    />
                  </div>
                  <div className="ncf-field">
                    <label className="ncf-label">Date</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="ncf-input"
                        value={row.date}
                        style={{ flex: 1 }}
                        onChange={(e) => {
                          const t = [...form.timeline];
                          t[i] = { ...t[i], date: e.target.value } as TimelineEntry;
                          set('timeline', t);
                        }}
                      />
                      <button
                        type="button"
                        className="ncf-btn-ghost"
                        onClick={() =>
                          set(
                            'timeline',
                            form.timeline.filter((_, j) => j !== i)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="ncf-btn-add"
                onClick={() => set('timeline', [...form.timeline, { label: '', date: '' }])}
              >
                + Add Timeline Row
              </button>
            </>
          )}

          {/* ── STEP 5: Prizes ── */}
          {step === 5 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 5</p>
                <h2>Prizes & Incentives</h2>
              </div>
              {field('Prize Summary Headline', 'prizeSummary.headline', {
                placeholder: '$2,000 Prize Pool + Official Licensing Opportunity',
              })}
              <ArrayField
                label="Prize Summary Bullets"
                values={form.prizeSummary.bullets}
                onChange={(v) => set('prizeSummary.bullets', v)}
              />
              <div className="ncf-divider" />
              <p className="ncf-section-label">Prize Tiers</p>
              {form.prizes.map((prize, i) => (
                <div key={i} className="ncf-prize-row">
                  <div className="ncf-grid-3" style={{ flex: 1 }}>
                    <div className="ncf-field">
                      <label className="ncf-label">Place</label>
                      <input
                        className="ncf-input"
                        value={prize.place}
                        onChange={(e) => {
                          const p = [...form.prizes];
                          p[i] = { ...p[i], place: e.target.value } as ContestPrize;
                          set('prizes', p);
                        }}
                      />
                    </div>
                    <div className="ncf-field">
                      <label className="ncf-label">Amount</label>
                      <input
                        className="ncf-input"
                        value={prize.amount}
                        placeholder="$1,000"
                        onChange={(e) => {
                          const p = [...form.prizes];
                          p[i] = { ...p[i], amount: e.target.value } as ContestPrize;
                          set('prizes', p);
                        }}
                      />
                    </div>
                    <div className="ncf-field" style={{ gridColumn: 'span 2' }}>
                      <label className="ncf-label">Description</label>
                      <input
                        className="ncf-input"
                        value={prize.description}
                        onChange={(e) => {
                          const p = [...form.prizes];
                          p[i] = { ...p[i], description: e.target.value } as ContestPrize;
                          set('prizes', p);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ncf-btn-ghost ncf-prize-del"
                    onClick={() =>
                      set(
                        'prizes',
                        form.prizes.filter((_, j) => j !== i)
                      )
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ncf-btn-add"
                onClick={() =>
                  set('prizes', [...form.prizes, { place: '', amount: '', description: '' }])
                }
              >
                + Add Prize Tier
              </button>
              <div className="ncf-divider" />
              {field('Licensing Opportunity Note', 'licensingOpportunityNote', {
                textarea: true,
                rows: 3,
              })}
              <div className="ncf-divider" />
              <ArrayField
                label="Submission Snapshot (sidebar card)"
                values={form.submissionSnapshot}
                onChange={(v) => set('submissionSnapshot', v)}
              />
              <ArrayField
                label="Commercial Intent (sidebar card)"
                values={form.commercialIntent}
                onChange={(v) => set('commercialIntent', v)}
              />
            </>
          )}

          {/* ── STEP 6: Judging & Legal ── */}
          {step === 6 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 6</p>
                <h2>Judging & Legal</h2>
              </div>
              <p className="ncf-section-label">Judging Criteria</p>
              {form.judging.criteria.map((c, i) => (
                <div key={i} className="ncf-grid-2" style={{ alignItems: 'flex-end' }}>
                  <div className="ncf-field">
                    <label className="ncf-label">Criterion Title</label>
                    <input
                      className="ncf-input"
                      value={c.title}
                      onChange={(e) => {
                        const cr = [...form.judging.criteria];
                        cr[i] = { ...cr[i], title: e.target.value } as JudgingCriterion;
                        set('judging.criteria', cr);
                      }}
                    />
                  </div>
                  <div className="ncf-field">
                    <label className="ncf-label">Description</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        className="ncf-input"
                        value={c.description}
                        style={{ flex: 1 }}
                        onChange={(e) => {
                          const cr = [...form.judging.criteria];
                          cr[i] = { ...cr[i], description: e.target.value } as JudgingCriterion;
                          set('judging.criteria', cr);
                        }}
                      />
                      <button
                        type="button"
                        className="ncf-btn-ghost"
                        onClick={() =>
                          set(
                            'judging.criteria',
                            form.judging.criteria.filter((_, j) => j !== i)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="ncf-btn-add"
                onClick={() =>
                  set('judging.criteria', [
                    ...form.judging.criteria,
                    { title: '', description: '' },
                  ])
                }
              >
                + Add Criterion
              </button>
              <div className="ncf-grid-2" style={{ marginTop: 16 }}>
                {field('Selection Type', 'judging.selectionType', {
                  placeholder: 'Internal Brand and MOD Review',
                })}
                {field('Review Team', 'judging.reviewTeam', {
                  placeholder: 'Brand Team, MOD Licensing Team…',
                })}
              </div>
              <div className="ncf-divider" />
              <p className="ncf-section-label">Legal Details</p>
              <div className="ncf-grid-2">
                {field('License Type', 'legal.licenseType', {
                  placeholder: 'Optional on selection',
                })}
                {field('Territory', 'legal.territory', { placeholder: 'Global' })}
              </div>
              {field('Rights Granted If Selected', 'legal.rightsGranted', {
                textarea: true,
                rows: 2,
              })}
              <div className="ncf-grid-2">
                {field('AI Policy (legal display)', 'legal.aiPolicy', {
                  placeholder: 'AI assisted only with disclosure',
                })}
                {field('Age Requirement', 'legal.ageRequirement', { placeholder: '18+' })}
              </div>
              {field('Contest Terms URL', 'legal.termsUrl', { placeholder: 'https://…/terms' })}
              {field('Submit Entry URL', 'submitUrl', { placeholder: 'https://…/submit' })}
            </>
          )}

          {/* ── STEP 7: FAQ & Finish ── */}
          {step === 7 && (
            <>
              <div className="ncf-card__head">
                <p className="ncf-eyebrow">Step 7</p>
                <h2>FAQ & Overview</h2>
              </div>
              <p className="ncf-section-label">FAQ Items</p>
              {form.faq.map((item, i) => (
                <div key={i} className="ncf-faq-row">
                  <div className="ncf-field" style={{ flex: 1 }}>
                    <label className="ncf-label">Question</label>
                    <input
                      className="ncf-input"
                      value={item.question}
                      onChange={(e) => {
                        const f = [...form.faq];
                        f[i] = { ...f[i], question: e.target.value } as FAQItem;
                        set('faq', f);
                      }}
                    />
                  </div>
                  <div className="ncf-field" style={{ flex: 1 }}>
                    <label className="ncf-label">Answer</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea
                        className="ncf-input ncf-textarea"
                        rows={2}
                        style={{ flex: 1 }}
                        value={item.answer}
                        onChange={(e) => {
                          const f = [...form.faq];
                          f[i] = { ...f[i], answer: e.target.value } as FAQItem;
                          set('faq', f);
                        }}
                      />
                      <button
                        type="button"
                        className="ncf-btn-ghost"
                        onClick={() =>
                          set(
                            'faq',
                            form.faq.filter((_, j) => j !== i)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="ncf-btn-add"
                onClick={() => set('faq', [...form.faq, { question: '', answer: '' }])}
              >
                + Add FAQ Item
              </button>
              <div className="ncf-divider" />
              <p className="ncf-section-label">Overview Paragraphs</p>
              {form.overviewParagraphs.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <textarea
                    className="ncf-input ncf-textarea"
                    rows={3}
                    style={{ flex: 1 }}
                    value={p}
                    onChange={(e) => {
                      const ps = [...form.overviewParagraphs];
                      ps[i] = e.target.value;
                      set('overviewParagraphs', ps);
                    }}
                  />
                  <button
                    type="button"
                    className="ncf-btn-ghost"
                    onClick={() =>
                      set(
                        'overviewParagraphs',
                        form.overviewParagraphs.filter((_, j) => j !== i)
                      )
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ncf-btn-add"
                onClick={() => set('overviewParagraphs', [...form.overviewParagraphs, ''])}
              >
                + Add Paragraph
              </button>
              <div className="ncf-divider" />
              <ArrayField
                label="Submission Checklist (sidebar)"
                values={form.submissionChecklist}
                onChange={(v) => set('submissionChecklist', v)}
              />
              {field('Inspiration Note (sidebar)', 'inspirationNote', { textarea: true, rows: 2 })}
              <div className="ncf-divider" />
              <div className="ncf-review-box">
                <p className="ncf-eyebrow">Ready to submit</p>
                <h3>"{form.title || 'Untitled Contest'}"</h3>
                <p>
                  {form.brand.name ? `Hosted by ${form.brand.name}` : 'No brand name entered yet'}
                </p>
                <p>
                  {form.submissionDeadlineDisplay
                    ? `Deadline: ${form.submissionDeadlineDisplay}`
                    : 'No deadline set'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="ncf-nav">
          {step > 1 && (
            <button type="button" className="ncf-btn-secondary" onClick={prev}>
              ← Previous
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            {step < STEPS.length ? (
              <button type="button" className="ncf-btn-primary" onClick={next}>
                Next →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="ncf-btn-secondary"
                  onClick={() => {
                    set('status', 'draft');
                    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                  }}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="ncf-btn-primary"
                  onClick={() => set('status', 'open')}
                >
                  Publish Contest
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  .ncf-wrap {
    --ncf-accent: #2563eb;
    --ncf-accent-soft: rgba(37,99,235,0.10);
    --ncf-bg: #f4f6fb;
    --ncf-surface: #ffffff;
    --ncf-text: #0f172a;
    --ncf-text-soft: #64748b;
    --ncf-border: #dbe3ef;
    --ncf-radius: 18px;
    --ncf-shadow: 0 10px 28px rgba(15,23,42,0.06);
    width: 100%;
    min-height: 100vh;
    background: var(--ncf-bg);
    padding: 32px 16px 80px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    color: var(--ncf-text);
    box-sizing: border-box;
  }
  .ncf-wrap * { box-sizing: border-box; }

  .ncf-header {
    max-width: 760px;
    margin: 0 auto 28px;
    text-align: center;
  }
  .ncf-header h1 { margin: 0 0 8px; font-size: clamp(28px,5vw,44px); letter-spacing: -0.03em; font-weight: 900; }
  .ncf-header__eyebrow, .ncf-eyebrow {
    text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; font-weight: 800;
    color: var(--ncf-text-soft); margin: 0 0 8px; display: block;
  }
  .ncf-header__sub { color: var(--ncf-text-soft); font-size: 16px; margin: 0; }

  .ncf-steps {
    display: flex; flex-wrap: wrap; gap: 8px;
    max-width: 760px; margin: 0 auto 20px;
    justify-content: center;
  }
  .ncf-step {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 999px;
    border: 1.5px solid var(--ncf-border);
    background: var(--ncf-surface);
    color: var(--ncf-text-soft);
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all .18s ease;
  }
  .ncf-step.is-active {
    border-color: var(--ncf-accent);
    color: var(--ncf-accent);
    background: var(--ncf-accent-soft);
  }
  .ncf-step.is-done {
    border-color: #15803d;
    color: #15803d;
    background: #ecfdf3;
  }
  .ncf-step__num {
    width: 22px; height: 22px; border-radius: 50%;
    background: currentColor; color: #fff;
    display: grid; place-items: center; font-size: 11px;
    opacity: 0.85;
  }
  .ncf-step.is-active .ncf-step__num,
  .ncf-step.is-done .ncf-step__num { opacity: 1; }

  .ncf-card {
    max-width: 760px; margin: 0 auto 16px;
    background: var(--ncf-surface);
    border: 1px solid var(--ncf-border);
    border-radius: 24px;
    padding: 32px 28px;
    box-shadow: var(--ncf-shadow);
  }
  .ncf-card__head { margin-bottom: 24px; }
  .ncf-card__head h2 { margin: 0 0 6px; font-size: 26px; letter-spacing: -0.03em; font-weight: 800; }
  .ncf-card__head p { margin: 0; color: var(--ncf-text-soft); font-size: 15px; }

  .ncf-field { margin-bottom: 16px; }
  .ncf-label {
    display: block; margin-bottom: 6px;
    font-size: 13px; font-weight: 700; color: var(--ncf-text);
  }
  .ncf-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--ncf-border);
    border-radius: 12px;
    font-size: 14px; color: var(--ncf-text);
    background: var(--ncf-surface);
    font-family: inherit;
    transition: border-color .18s ease, box-shadow .18s ease;
    outline: none;
    appearance: none;
  }
  .ncf-input:focus {
    border-color: var(--ncf-accent);
    box-shadow: 0 0 0 3px var(--ncf-accent-soft);
  }
  .ncf-textarea { resize: vertical; }
  .ncf-select { cursor: pointer; }
  input[type="color"].ncf-input {
    padding: 4px 6px; height: 44px; cursor: pointer;
  }

  .ncf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ncf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  @media (max-width: 600px) {
    .ncf-grid-2, .ncf-grid-3 { grid-template-columns: 1fr; }
  }

  .ncf-divider {
    border: none; border-top: 1px solid var(--ncf-border);
    margin: 20px 0;
  }
  .ncf-section-label {
    font-size: 12px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--ncf-text-soft);
    margin: 0 0 14px;
  }

  .ncf-btn-add {
    background: none; border: 1.5px dashed var(--ncf-border);
    color: var(--ncf-text-soft); font-size: 13px; font-weight: 700;
    padding: 9px 14px; border-radius: 10px; cursor: pointer;
    transition: all .18s ease;
  }
  .ncf-btn-add:hover { border-color: var(--ncf-accent); color: var(--ncf-accent); }

  .ncf-btn-ghost {
    background: none; border: 1.5px solid var(--ncf-border);
    color: var(--ncf-text-soft); font-size: 13px;
    padding: 9px 12px; border-radius: 10px; cursor: pointer;
    flex-shrink: 0;
    transition: all .18s ease;
  }
  .ncf-btn-ghost:hover { border-color: #b42318; color: #b42318; }

  .ncf-prize-row {
    display: flex; gap: 10px; align-items: flex-start;
    background: #f8fafc; border: 1px solid var(--ncf-border);
    border-radius: 14px; padding: 14px; margin-bottom: 10px;
  }
  .ncf-prize-del { margin-top: 30px; }

  .ncf-faq-row {
    display: flex; gap: 12px; margin-bottom: 14px;
    background: #f8fafc; border: 1px solid var(--ncf-border);
    border-radius: 14px; padding: 14px;
  }

  .ncf-review-box {
    background: var(--ncf-accent-soft);
    border: 1.5px solid rgba(37,99,235,0.18);
    border-radius: 16px; padding: 20px;
  }
  .ncf-review-box h3 { margin: 4px 0 8px; font-size: 20px; letter-spacing: -0.02em; }
  .ncf-review-box p { margin: 0 0 4px; color: var(--ncf-text-soft); font-size: 14px; }

  .ncf-nav {
    max-width: 760px; margin: 0 auto;
    display: flex; align-items: center; gap: 10px;
  }
  .ncf-btn-primary, .ncf-btn-secondary {
    min-height: 48px; padding: 0 22px;
    border-radius: 14px; font-size: 14px; font-weight: 800;
    cursor: pointer; border: none;
    transition: transform .18s ease, box-shadow .18s ease;
    font-family: inherit;
  }
  .ncf-btn-primary:hover, .ncf-btn-secondary:hover { transform: translateY(-1px); }
  .ncf-btn-primary {
    background: var(--ncf-accent); color: #fff;
    box-shadow: 0 8px 20px rgba(37,99,235,0.22);
  }
  .ncf-btn-secondary {
    background: var(--ncf-surface); color: var(--ncf-text);
    border: 1.5px solid var(--ncf-border);
  }

  .ncf-success {
    max-width: 480px; margin: 80px auto; text-align: center;
    background: var(--ncf-surface); border-radius: 24px;
    padding: 48px 32px; border: 1px solid var(--ncf-border);
    box-shadow: var(--ncf-shadow);
  }
  .ncf-success__icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: #ecfdf3; color: #15803d;
    font-size: 24px; font-weight: 900;
    display: grid; place-items: center; margin: 0 auto 20px;
  }
  .ncf-success h2 { margin: 0 0 10px; font-size: 28px; letter-spacing: -0.03em; }
  .ncf-success p { color: var(--ncf-text-soft); margin: 0 0 24px; }
`;
