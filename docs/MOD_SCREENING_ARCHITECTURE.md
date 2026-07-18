# CLAUDE.md — MOD AI Screening Pipeline (integration into backend/ v1)

You are integrating an AI artwork-screening pipeline into an EXISTING, LIVE codebase.
Ground truth about this repo is in `docs/EXISTING_STATE.md` — read it before structural decisions.
The screening design rationale is in `docs/MOD_SCREENING_ARCHITECTURE.md` — its *invariants* apply;
its greenfield schema/layout do NOT (this file supersedes them where they conflict).

## Scope boundaries (hard)

- ALL work happens in `backend/` (the live Express 5 + Kysely app). **Never touch `backend-v2/`** —
  it does not compile and is out of scope. Do not "fix" it, do not import from it.
- `frontend/` and `dashboard/` changes only in the phases that explicitly say so.
- Language: **plain JavaScript, CommonJS**, matching the existing codebase. Do NOT introduce
  TypeScript compilation into the app. Use JSDoc typedefs (the `src/db/types.js` pattern) for types.
- Package manager: **npm** (the Dockerfile and CI use it). Do not run pnpm.
- If a needed table/route/name overlaps with something existing, STOP and ask — never create a
  parallel duplicate of an existing concept.

## What already exists — reuse, don't recreate

| Need | Use this existing thing |
|---|---|
| Submission subject | `artworks` table (`creator_id`, `file_url`, `status`, `moderation_status`, `moderated_by`, `moderated_at`) |
| Contest context | `contest_entries` (references artwork; has its own `moderation_status`) |
| Human review queue | `moderation_queue` table (polymorphic `entity_type`/`entity_id`, `status`, `priority`, `assigned_to`, `reviewed_by`, `decision`, `notes`) — exists in DB, unwired in code. Extend it; do not create `review_items`. |
| Audit trail | `audited_events` (`actor_id`, `action`, `entity_type`/`entity_id`, `old_values`/`new_values` jsonb) — write to it, don't create `audit_log` |
| Route prefix | `/api/moderation` — a `src/modules/moderation/` module exists on disk but is NOT mounted in `index.js`. Read it first; wire/replace it to match the frontend contract below. |
| API contract | `frontend/services/api/moderationApi.ts` already calls `/moderation/submit`, `/moderation/queue`, `/moderation/metrics`. `frontend/app/compliance/*` settings pages define config field names (`confidenceThreshold`, `autoRejectAI`, `sensitivityLevel`, `checkCharacterAccuracy`, …). Implement to THIS contract; extend it, don't contradict it. |
| Auth | Firebase ID tokens via `authenticateToken` (`src/common/middleware/auth.middleware.js`) + `hasPermission()` from `roles.permissions` jsonb. Use these; do not add a new auth mechanism. |
| Storage | `CDNFileService` (S3, `src/modules/cdn/services/cdn-file.service.js`). Do not use the dead Vercel Blob wrapper or `cdn.config.js`. |
| Email | SendGrid via `src/config/sendgrid.js` + `src/common/emails/`. |
| Validation | `zod` is already a dependency (currently unused). USE IT for: ruleset config schema, external API response parsing, request bodies on all NEW routes. Do not retrofit it onto old routes. |

## New tables (and column additions) — the only schema changes allowed

New tables (all `uuid DEFAULT gen_random_uuid()` PKs, `snake_case`, `created_at/updated_at timestamptz DEFAULT now()` — match existing conventions):

```sql
screening_runs (
  id uuid PK,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  contest_entry_id uuid NULL REFERENCES contest_entries(id) ON DELETE SET NULL,
  ruleset_id uuid NOT NULL REFERENCES rulesets(id),
  status text NOT NULL CHECK (status IN ('running','complete','failed')),
  aiornot jsonb,          -- { human_score, ai_score, detected_generator, latency_ms }
  moderation jsonb,       -- { categories, scores, verdict }
  style jsonb,            -- { style_score, brand_fit_score, violations }
  decision text CHECK (decision IN ('auto_approved','auto_rejected','flagged_manual')),
  decision_reasons jsonb, -- ordered rule hits
  started_at timestamptz, finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
)

rulesets (
  id uuid PK,
  brand_id uuid NULL REFERENCES brands(id) ON DELETE CASCADE,  -- NULL = platform default
  version int NOT NULL,
  config jsonb NOT NULL,   -- zod-validated; field names align with frontend compliance UI
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, version)
)  -- IMMUTABLE: edits insert a new version, never UPDATE config

style_guides (
  id uuid PK,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  source_file_url text,      -- stored via CDNFileService
  parsed_rules jsonb,
  prompt_block text,         -- compiled once at upload, injected into style-stage calls
  created_at/updated_at
)
```

Column additions:
```sql
ALTER TABLE moderation_queue ADD COLUMN screening_run_id uuid REFERENCES screening_runs(id);
ALTER TABLE moderation_queue ADD COLUMN rule_matches jsonb;
```

Do NOT add: `submissions`, `review_items`, `audit_log`, `daily_stats` (metrics are computed
on read in v1's style; a stats table is out of scope until proven slow).

## Invariants (carried over from the architecture doc — non-negotiable)

1. **Single transition function.** All writes to `artworks.moderation_status` /
   `contest_entries.moderation_status` / `moderation_queue.status` for screening go through ONE
   function (`src/modules/moderation/services/transition.service.js`) that also inserts the
   `audited_events` row. Grep in review: no other file writes these columns.
2. **Pure decision engine.** `evaluate(stageResults, rulesetConfig) → { decision, reasons[] }`
   in `src/modules/moderation/services/decision.engine.js`. No DB, no network, no Date.now().
   Exhaustive table-driven tests exist BEFORE any real API adapter is written.
   Precedence: hard-reject moderation categories → authenticity borderline band → authenticity
   fail (reject|flag per config) → flag categories → style violation (reject|flag per config) →
   auto-approve if all requires met → fallback `flagged_manual`. Fallback is ALWAYS manual.
3. **All stages always run** (no short-circuit on early flags), except style stage skips when
   the effective ruleset has style disabled or the artwork has no brand context.
4. **Idempotent stages.** BullMQ job id = screening_run_id. Each stage writes its jsonb column
   only if currently NULL; on retry, completed stages are skipped.
5. **Ruleset resolution:** brand's latest version if the artwork has brand/contest context,
   else platform default (brand_id IS NULL). Every run records the exact ruleset_id used.
6. **Untrusted text stays untrusted.** Artwork title/description/tags enter LLM prompts inside
   delimiters with an instruction to treat them as data. Never interpolated into system prompts.
7. **Degradation goes to humans, never to approval.** Any stage marked `unavailable` after
   retries forces `flagged_manual`.
8. **New routes are actually authorized.** Every new `/api/moderation/*` admin/brand route gets
   `authenticateToken` + a `hasPermission()` check. Do NOT copy the existing admin module's
   pattern (it has no role checks — that is a known hole, not a convention to follow).

## Worker & infrastructure

- Add `bullmq` + `ioredis` to `backend/package.json`.
- Worker entrypoint: `backend/worker.js` (sibling of `index.js`). Same Docker image, CMD override.
- Local dev: `docker run` Redis or a `docker-compose.dev.yml` (dev-only; prod stays raw docker run).
- Prod (extend `.github/workflows/backend-workflow.yaml` deploy step, same VPS, same `mod-network`):
  ```
  docker run -d --name modfanart-redis --restart unless-stopped \
    --network mod-network -v redis-data:/data redis:7-alpine
  docker run -d --name modfanart-worker --restart unless-stopped \
    --network mod-network --env-file /opt/dev/apps/modfanart-backend/.env \
    ghcr.io/modfanart/modfanart-backend:latest node worker.js
  ```
  Redis is NOT port-mapped to the host; API and worker reach it as `redis://modfanart-redis:6379`.
- New env vars: `REDIS_URL`, `AIORNOT_API_KEY`, `OPENAI_API_KEY`. Read via `process.env` at module
  top like the rest of the codebase; worker crashes at boot if AI keys are missing.
- Queue: `screening`, job `screen-artwork { artworkId, runId, contestEntryId? }`,
  5 attempts, exponential backoff, DLQ = failed set + `screening_runs.status='failed'` +
  admin notification via existing notifications module.

## Module layout (inside existing conventions)

```
backend/src/modules/moderation/        # reconcile with what's already on disk here FIRST
├── moderation.routes.js               # mounted in index.js at /api/moderation
├── controller/moderation.controller.js
├── services/
│   ├── decision.engine.js             # pure
│   ├── transition.service.js          # single write path + audited_events
│   ├── screening.service.js           # creates runs, enqueues
│   └── ruleset.service.js             # versioned config, zod schema
├── adapters/
│   ├── aiornot.adapter.js  ├── openai-moderation.adapter.js  ├── style.adapter.js
│   └── mock/                          # phase-1 fakes, same interface
└── models/                            # thin Kysely classes, matching Artwork/Brand pattern
backend/worker.js
backend/src/queue/screening.queue.js   # queue + worker processor
```

## Pipeline trigger

Hook into `ArtworkController.createArtwork` AFTER the S3 upload + artwork insert succeed:
set `moderation_status='pending'`, `status='moderation_pending'`, create screening_run, enqueue.
Contest entry creation likewise enqueues with `contest_entry_id` set. Keep the hook to ~5 lines
calling `screening.service.js` — do not inline pipeline logic into the artwork controller.

## API surface (match frontend contract, then extend)

```
POST /api/moderation/submit            # manual (re)screen request — shape per moderationApi.ts
GET  /api/moderation/queue             # review queue; filters: status, entity_type, brand
GET  /api/moderation/metrics           # computed on read from screening_runs + moderation_queue
POST /api/moderation/queue/:id/resolve # { decision: approved|rejected|escalated, notes }
GET  /api/moderation/runs/:artworkId   # screening history for an artwork
GET|POST /api/moderation/rulesets      # brand-scoped via brand.middleware; POST = new version
POST /api/moderation/style-guides      # multipart upload via existing singleUpload middleware
```
Response shape: match the loose existing style (`{ success, message, ...payload }` on writes,
bare objects/lists on reads) — do not introduce a new envelope convention mid-codebase.
Before finalizing request/response shapes, READ `frontend/services/api/moderationApi.ts` and the
compliance settings components, and mirror their field names in `rulesets.config`.

## Testing (first tests in this repo — scoped to this module only)

- Add `vitest` as devDependency, `"test": "vitest run"` script.
- Required suites: decision engine (table-driven, every precedence branch, plus property "never
  auto_approved unless all requires met"), transition service (illegal transitions throw; every
  legal one writes audited_events), processor resume-after-retry with mock adapters.
- Do not write tests for pre-existing modules; out of scope.
- Verification is raw output: curl responses against a locally running stack and vitest output.

## Phases

**Phase 0 — unblock (do first, smallest possible diff):**
1. Fix migration tooling: `src/scripts/migrate.js` exists but npm scripts call `migrate.ts` —
   fix the scripts; create `src/migrations/`.
2. Baseline migration: introspect the LIVE DEV DATABASE (`DATABASE_URL`), not
   `mod_dev_test_backup.sql` (the dump is stale — it lacks `users.firebase_uid`, which live code
   queries). Generate a no-op-on-existing baseline (`CREATE TABLE IF NOT EXISTS` or a marker
   migration) so future migrations run cleanly on both fresh and existing DBs. Verify by running
   migrate:status against dev.
3. Add vitest. Exit: `npm run db:migrate` and `npm test` both run without error.

**Phase 1 — core loop with fakes:** migrations for new tables + moderation_queue columns; zod
ruleset schema seeded with a platform-default ruleset; decision engine + full tests; transition
service + tests; queue + worker with mock adapters; artwork-create hook. Exit: upload an artwork
locally → worker runs → decision recorded → `artworks.moderation_status` updated → audited_events
row exists. Shown via curl + psql output.

**Phase 2 — real adapters:** AIORNOT (verify current endpoint/pricing from their docs before
coding), OpenAI omni-moderation (image + title/description/tags), retries/DLQ, creator
notification via existing notifications module + SendGrid template. Exit: real image, real
verdict; kill worker mid-run, retry resumes at the incomplete stage.

**Phase 3 — brand config + review:** ruleset versioning API mapped to compliance UI field names;
style guide upload + one-time parse job compiling `prompt_block`; style stage; wire
`/api/moderation` queue + resolve endpoints with real permission checks. Frontend: connect the
existing `frontend/app/compliance/*` pages and `pending-entries-review.tsx` to the live API.
Dashboard: implement the reserved `/review-automation` route for MOD-admin review.
Exit: brand edits thresholds → new version; flagged artwork resolved by a human; override visible
in audited_events.

**Phase 4 — metrics + hardening:** `/metrics` computed queries (add indexes on
`screening_runs.artwork_id`, `moderation_queue.status` as needed); per-artist submission rate
limit reusing `express-rate-limit`; sha256 dedupe (new `file_sha256` column on artworks) flagging
resubmission of rejected images; `POST /api/moderation/submit` rescreen path. Exit: 200 artworks
in 10 min locally, zero stuck runs.

Do not start a later phase early. At each phase exit, stop and report with raw evidence.

## Known repo hazards (do not "helpfully" fix unless asked; do not replicate)

- Committed Firebase service-account JSON in `backend/` — flag it, never commit new secrets.
- `/api/admin/*` and `/api/roles` lack role checks — do not copy that pattern.
- Dual npm/pnpm lockfiles — use npm, don't delete anything without asking.
- `Dockerfile` says `EXPOSE 3000`, app binds 5000 — harmless, leave it unless asked.
- Role name constants in code don't match DB seed data — use `hasPermission()` (data-driven),
  avoid hardcoded role-name checks in new code.