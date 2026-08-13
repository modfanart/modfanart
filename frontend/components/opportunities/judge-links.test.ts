/**
 * Every link in the judge area must resolve to a real route.
 *
 * Joey reported two dead buttons on the judge dashboard: Start 404'd and the
 * eye returned "Contest not found". Both were built from contest.slug. There
 * is no /contest/[id]/judge route at all, and the public contest page resolves
 * its param with .where("id", "=", id) and no slug fallback.
 *
 * Types cannot catch this: every one of those hrefs is a well-typed string.
 * The only thing that can is checking the URL against the routes the app
 * actually builds. This reads .next/routes-manifest.json, so it needs a build
 * to have run.
 *
 * Run: npx tsx components/opportunities/judge-links.test.ts
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type Manifest = {
  dynamicRoutes: Array<{ page: string; regex: string }>;
  staticRoutes: Array<{ page: string; regex: string }>;
};

const MANIFEST = join(process.cwd(), '.next', 'routes-manifest.json');

// Realistic values. The ids are UUIDs and the slug is a slug, because the bug
// was precisely that the two are not interchangeable.
const USERNAME = 'judgejoe';
const CONTEST_ID = '187a7316-1861-45a3-8d2c-c3e8700de210';
const CONTEST_SLUG = 'the-librarians-2026';
const TOKEN = 'k1Qw8ZvR';

const judgeBase = `/judge/${USERNAME}`;

/** Every link reachable from the judge area, with where it is built. */
const LINKS: Array<{ where: string; url: string }> = [
  { where: 'JudgeDashboardContent: View My Profile', url: `/u/${USERNAME}` },
  { where: 'JudgeDashboardContent: Start', url: `${judgeBase}/contest/${CONTEST_ID}` },
  { where: 'JudgeDashboardContent: eye / view contest', url: `/contest/${CONTEST_ID}` },
  { where: 'judge contest page: Review Queue', url: `${judgeBase}/contest/${CONTEST_ID}/review-queue` },
  { where: 'opportunities: Start / View', url: `${judgeBase}/contest/${CONTEST_ID}` },
  { where: 'opportunities: Standings', url: `${judgeBase}/results/${CONTEST_ID}` },
  { where: 'sidebar: Judging', url: judgeBase },
  { where: 'sidebar: Overview', url: judgeBase },
  { where: 'sidebar: Opportunities', url: `${judgeBase}/opportunities` },
  { where: 'invite: complete step', url: `/judge/invite/${TOKEN}/complete` },
  { where: 'invite complete: back to invite', url: `/judge/invite/${TOKEN}` },
  { where: 'invite complete: go to dashboard', url: judgeBase },
  { where: 'redeemInviteLink redirect_to', url: `${judgeBase}/contest/${CONTEST_ID}` },
];

/** URLs that must NOT resolve. These are the shapes that shipped broken. */
const REGRESSIONS: Array<{ why: string; url: string }> = [
  { why: 'Start built from the slug under /contest', url: `/contest/${CONTEST_SLUG}/judge` },
  { why: 'Review Queue when getBasePath returns null', url: `/null/contest/${CONTEST_ID}/review-queue` },
  { why: 'Review Queue for a judge whose role is ARTIST', url: `/artist/${USERNAME}/contest/${CONTEST_ID}/review-queue` },
];

function main() {
  if (!existsSync(MANIFEST)) {
    console.error('No .next/routes-manifest.json. Run `npm run build` first.');
    process.exit(2);
  }

  const m: Manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const routes = [...(m.dynamicRoutes ?? []), ...(m.staticRoutes ?? [])].filter((r) => r.regex);
  const resolve = (url: string) => routes.find((r) => new RegExp(r.regex).test(url))?.page;

  let pass = 0;
  const failures: string[] = [];

  for (const { where, url } of LINKS) {
    const page = resolve(url);
    if (page) {
      pass++;
      console.log(`  PASS  ${where}\n          ${url} -> ${page}`);
    } else {
      failures.push(`${where}: ${url} matches NO route (404)`);
      console.log(`  FAIL  ${where}\n          ${url} -> NO ROUTE`);
    }
  }

  for (const { why, url } of REGRESSIONS) {
    const page = resolve(url);
    // A slug-shaped URL still matches /contest/[id]; the point is that the
    // broken shapes above must not silently start resolving again.
    if (!page) {
      pass++;
      console.log(`  PASS  stays dead: ${why}`);
    } else {
      failures.push(`${why}: ${url} unexpectedly resolves to ${page}`);
      console.log(`  FAIL  ${why}: ${url} -> ${page}`);
    }
  }

  // The checks above validate URL shapes written out in this file. That proves
  // the shapes are routable but not that the components still build them, so
  // grep the sources for the two constructs that caused the bug.
  const SOURCES = [
    'app/(dashboard)/judge/[judgeId]/JudgeDashboardContent.tsx',
    'app/(dashboard)/judge/[judgeId]/contest/[contestId]/page.tsx',
    'app/(dashboard)/judge/[judgeId]/opportunities/page.tsx',
  ];
  const BANNED = [
    { pattern: /href=\{`[^`]*\$\{contest\.slug\}/, why: 'href built from contest.slug; routes and the API both key on id' },
    { pattern: /getBasePath/, why: 'getBasePath is role-keyed and 404s for judges who are not role JUDGE' },
  ];

  for (const rel of SOURCES) {
    const src = readFileSync(join(process.cwd(), rel), 'utf8');
    for (const { pattern, why } of BANNED) {
      // Ignore the explanatory comments that reference these by name.
      const code = src
        .split('\n')
        .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
        .join('\n');
      if (pattern.test(code)) {
        failures.push(`${rel}: ${why}`);
        console.log(`  FAIL  ${rel}: ${why}`);
      } else {
        pass++;
        console.log(`  PASS  ${rel} is free of: ${why.split(';')[0]}`);
      }
    }
  }

  console.log(`\n===== ${pass} passed, ${failures.length} failed =====`);
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(failures.length ? 1 : 0);
}

main();
