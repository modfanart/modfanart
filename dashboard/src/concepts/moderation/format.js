// Display helpers shared by the AI moderation page.

/** A 0..1 score as a percentage. Small scores keep a decimal so 0.4% does not read as 0%. */
export const formatPercent = value => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';

  const pct = value * 100;

  if (pct > 0 && pct < 0.1) return '<0.1%';

  return `${pct < 10 ? Number(pct.toFixed(1)) : Math.round(pct)}%`;
};

/** snake_case / kebab-case → "Sentence case". */
export const humanize = value => {
  if (!value) return 'Unknown';

  const text = String(value).replace(/[_-]+/g, ' ');

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDateTime = value =>
  value ? new Date(value).toLocaleString() : '—';

export const formatDate = value =>
  value ? new Date(value).toLocaleDateString() : '—';

/** The backend answers errors with `{ error }`; network failures come back from RTK as `{ error }`. */
export const getApiErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.data?.error || error?.data?.message || error?.error || fallback;

// ────────────────────────────────────────────────
// Badge styles for the automated and human decisions
// ────────────────────────────────────────────────

const GOOD = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
const BAD = 'border-red-500/20 bg-red-500/10 text-red-400';
const REVIEW = 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
const ESCALATED = 'border-violet-500/20 bg-violet-500/10 text-violet-300';

export const SCREENING_DECISIONS = {
  auto_approved: { label: 'Auto-approved', className: GOOD },
  auto_rejected: { label: 'Auto-rejected', className: BAD },
  flagged_manual: { label: 'Flagged for review', className: REVIEW },
};

export const REVIEW_DECISIONS = {
  approved: { label: 'Approved', className: GOOD },
  rejected: { label: 'Rejected', className: BAD },
  escalated: { label: 'Escalated', className: ESCALATED },
};

const isPdf = url => Boolean(url && /\.pdf(\?|#|$)/i.test(url));

// The image to show for an artwork. A PDF upload's thumbnail is its rendered first page, but falls
// back to the PDF itself when rendering failed, and an <img> pointed at a PDF is a broken image.
// null means there is no raster to show.
export const previewSrc = artwork =>
  [artwork?.thumbnail_url, artwork?.file_url].find(url => url && !isPdf(url)) ?? null;

// The full-size image for the preview dialog: the original, unless it is a PDF.
export const fullSizeSrc = artwork =>
  artwork?.file_url && !isPdf(artwork.file_url) ? artwork.file_url : previewSrc(artwork);
