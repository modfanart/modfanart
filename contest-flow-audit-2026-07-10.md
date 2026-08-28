# Contest & Submission Flow — What Exists vs What's Missing

Audit date: 2026-07-10
Covers 3 tickets: "Setup full contest and submission flow backend",
"Link artists and brand owners with contest ID", "Create viewable
approved artwork page".

Context: today's session set up a working end-to-end test (brand owner
creates contest → artist submits → brand owner approves) using two
manually-configured accounts (jyotishmoydeka62, dev.merchondemand@gmail.com)
and a manually-seeded brand/contest. This document separates what is
**real, generic, working code** from what was **manually bypassed for
testing** and from what **genuinely does not exist yet**.


## TICKET 1: Setup full contest and submission flow backend

### ✅ EXISTS — Contest creation (backend)
- `POST /api/contest` (`backend/src/modules/contests/controller/contest.controller.js:80`)
- Fully implemented: validates required fields (brand_id, title,
  description, start_date, submission_end_date), validates dates,
  checks the brand exists, generates a unique slug, wraps insert in a
  transaction.
- This is real, generic code — not tied to any specific account.

### ✅ EXISTS — Contest creation (frontend)
- `frontend/app/(dashboard)/brand-manager/[slug]/opportunities/create/page.tsx`
- A full form (title, dates, prizes, categories, visibility, etc.)
  that calls the real `useCreateContestMutation`.
- Correctly scopes `brand_id` to the logged-in user's own brand via
  `user.brands[0]` (from `AuthContext`, which we fixed today) — does
  NOT let a user pick an arbitrary brand from a dropdown.

### ✅ EXISTS — Submission flow (backend + frontend)
- `POST /api/artwork` (create artwork, uploads to S3 — fixed today)
- `POST /api/contest/:contestId/entries` (submit to contest) —
  `backend/src/modules/contests/controller/contestEntry.controller.js`
- `frontend/components/submissions/new-submission.tsx` — real form,
  uploads file, picks category/tags, submits to a specific contest.
- Verified working end-to-end today with real data (S3 upload
  confirmed, contest_entries row created, status flows
  pending → approved).

### ✅ FIXED — Authorization check on contest creation
- `createContest` previously only checked `req.user?.id` exists (i.e.
  "are you logged in at all") — it did NOT check that the logged-in
  user actually owns/manages the `brand_id` they're submitting.
- Fixed (local only, not yet pushed/deployed to production): added
  `req.user.brands.some(b => b.id === brand_id) || req.user.permissions?.['contests.manage']`
  check right after the brand-existence check in
  `backend/src/modules/contests/controller/contest.controller.js:145-152`.
  Returns 403 if the logged-in user doesn't own/manage the target
  brand and lacks the admin override permission.
- Verified against real local data: the real brand owner
  (jyotishmoydeka62) resolves as authorized for "The Librarians";
  an unrelated artist account correctly resolves as not authorized.

### ❌ GAP — No self-service brand onboarding
- A brand-new signup (accountType: 'brand') gets stuck at a pending
  "Brand Verification Request" with no working approval path in the
  main frontend app. (Full detail in the earlier gaps file,
  `gaps-identified-2026-07-08.txt`, gap #1.)
- This means: the contest-creation flow above only becomes reachable
  once a brand account is manually set up (as we did today for testing)
  — a brand-new user cannot reach this flow on their own yet.


## TICKET 2: Link artists and brand owners with contest ID

### ✅ EXISTS — The actual linking mechanism
The `contest_entries` table IS the link between everything:
- `contest_entries.contest_id` — which contest
- `contest_entries.artwork_id` — which artwork
- `contest_entries.creator_id` — which artist (set automatically from
  `req.user.id` at submission time — the artist never has to specify
  this manually)

Brand-owner ↔ contest linking is separate and already exists via
`contests.brand_id` → `brands.user_id` (direct owner) or
`brand_managers` (team members) — set once when the contest is
created, not per-submission.

**This is real, generic code.** It is NOT hardcoded to specific
accounts — the same `req.user.brands.some(b => b.id === contest.brand_id)`
check (fixed today) works for any real brand owner, not just the two
test accounts. What WAS hardcoded today was the underlying *data*
(we manually inserted the brand/contest rows and set two accounts'
roles) — the *logic* itself is generic and already correct.

### ✅ FIXED — Same authorization gap as Ticket 1
- Now that contest creation verifies brand ownership (see Ticket 1
  fix above), a contest can no longer be created under a brand_id its
  creator doesn't own/manage — closing the one remaining gap in this
  otherwise-correct linking chain.


## TICKET 3: Create viewable approved artwork page

### ✅ EXISTS — An artwork detail page
- `frontend/app/(gallery)/artwork/[id]/page.tsx`
- Real page: fetches artwork by ID, shows image, description,
  pricing tiers, categories, tags. Has licensing sub-pages too
  (`/artwork/[id]/license`).

### ❌ GAP — No status/approval filtering anywhere
- Backend `getArtwork` (`backend/src/modules/artworks/controller/artwork.controller.js:142`)
  has NO status check at all — any artwork (draft, published,
  rejected) is fully viewable by anyone with its ID, no auth
  required. There is no distinction between "approved contest
  entry" and "random draft artwork" at the artwork level.

### ❌ GAP — No discovery/browse page for approved entries
- There is no gallery, listing, or "winners" page anywhere that
  filters specifically for approved contest_entries and links to
  their artwork pages. The individual artwork page is reachable
  ONLY if you already know/have the exact artwork ID (e.g. via the
  judge dashboard at `app/(dashboard)/judge/[judgeId]/contest/[contestId]/page.tsx`,
  which is the only frontend page found that calls
  `useGetContestEntriesQuery` — and it's role-gated to judges, not
  public).

### ❌ GAP — Approving a contest_entries row doesn't change the artwork's own status
- `ContestEntry.approve(id)` only updates `contest_entries.status`.
- The underlying `artworks.status` stays whatever it was (`draft` in
  every test case today) — approval is not reflected on the artwork
  record itself, only on the join row.
- Since `getArtwork` doesn't filter by status anyway, this doesn't
  currently break anything visibly, but it means "approved" isn't a
  real, queryable state on the artwork — only inferable by joining
  through `contest_entries`.


## Summary: what "hardcoded" actually meant today

To directly answer the recurring question — the flow itself
(create campaign → submit → review → approve/reject) is real,
generic, working code, verified end-to-end with production data
today. What was manually set up (hardcoded) was:
1. The `brands` and `contests` rows themselves (no self-service way
   to create these yet without an existing brand owner account).
2. Two specific accounts' roles and brand ownership, done directly
   via database inserts because the real brand-signup-to-owner
   pipeline (Ticket 1's onboarding gap) doesn't work yet.

Nothing in the actual authorization/linking logic is tied to those
two specific accounts — the same code path works for any account in
the same role/ownership configuration.
