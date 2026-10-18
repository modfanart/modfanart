# CLAUDE.md — MOD AI Screening Pipeline (integration into backend/ v1)

You are integrating an AI artwork-screening pipeline into an EXISTING, LIVE codebase.
Ground truth about this repo is in `docs/EXISTING_STATE.md` — read it before structural decisions.
This file is the single working spec. (`docs/MOD_SCREENING_ARCHITECTURE.md` was a byte-identical
duplicate of this file and has been deleted; do not recreate it.)

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
| Route prefix | Two namespaces. `/api/screening/*` = new screening-specific resources (runs, rulesets, style guides). `/api/moderation/*` = the shared human-review + user-reporting surface (`queue`, `queue/:id/resolve`, `metrics`, and the pre-existing `submit`). The `src/modules/moderation/` module on disk is NOT mounted in `index.js` and is broken; reduce it to the review surface. |
| API contract | `frontend/services/api/moderationApi.ts` calls `/moderation/submit`, `/moderation/queue`, `/moderation/metrics`. **Read it carefully: `submit` is a USER-REPORTING endpoint** (`{ entity_type, entity_id, violation_type, description }`), not screening. Screening must not squat that path — hence `/api/screening/*`. `frontend/app/compliance/*` settings pages define ruleset config field names (`confidenceThreshold`, `autoRejectAI`, `sensitivityLevel`, `notifyArtist`, `enabled`) and `frontend/lib/db/config-service.ts` defines the rest (`aiDetectionThreshold`, `contentSafetyThreshold`, `ipComplianceThreshold`, `autoRejectThreshold`, `autoApproveThreshold`, `requireHumanReview`). Mirror those names; extend, don't contradict. |
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
- Optional env vars: `SCREENING_ADAPTERS=mock` swaps in the fake adapters so the pipeline can be
  exercised end to end without spending money or holding real keys — this is also what lets the
  worker boot without the AI keys. `SUBMISSION_RATE_LIMIT` (default 60) and
  `SUBMISSION_RATE_WINDOW_MS` (default 1h) tune the per-artist submission cap.
- Queue: `screening`, job `screen-artwork { artworkId, runId, contestEntryId? }`,
  5 attempts, exponential backoff, DLQ = failed set + `screening_runs.status='failed'` +
  admin notification via existing notifications module.

## Module layout (inside existing conventions)

```
backend/src/modules/screening/         # NEW: the AI pipeline
├── screening.routes.js                # mounted in index.js at /api/screening
├── screening.permissions.js           # permission middleware; see the note below
├── screening.hook.js                  # failure-tolerant trigger for the upload controllers
├── db.js                              # lazy getDb(), so requiring a module can't exit the process
├── controller/screening.controller.js
├── services/
│   ├── decision.engine.js             # pure
│   ├── transition.service.js          # single write path + audited_events
│   ├── screening.service.js           # creates runs, enqueues, orchestrates stages
│   ├── ruleset.service.js             # versioned config, zod schema
│   ├── styleGuide.service.js          # text extraction -> parsed_rules -> prompt_block
│   ├── dedupe.service.js              # sha256 short circuit on resubmitted rejections
│   ├── notification.service.js        # in-app + SendGrid, gated on notifyArtist
│   └── image.loader.js                # S3 bytes + per-provider size caps
├── adapters/
│   ├── aiornot.adapter.js  ├── openai-moderation.adapter.js  ├── style.adapter.js
│   └── mock/                          # fakes with the same interface, via SCREENING_ADAPTERS=mock
├── models/                            # thin Kysely classes, matching Artwork/Brand pattern
└── __fixtures__/fakeDb.js             # in-memory Kysely stand-in used by the unit suites
backend/src/modules/moderation/        # EXISTING, broken + unmounted: reduce to review surface
├── moderation.routes.js               # mounted in index.js at /api/moderation
├── controller/moderation.controller.js  # rewrite: queue, resolve, metrics, report
└── models/moderation.model.js         # kept, plus enqueueReport for user reports
backend/worker.js
backend/src/queue/screening.queue.js   # queue + worker processor
backend/src/common/middleware/submission.rate-limit.js   # per-artist cap, keyed on user id
```

Two things about the surrounding code that this module has to work around:

- `src/config/index.js` calls `process.exit(1)` when it cannot reach Postgres, at import time. Any
  module that requires it directly is therefore untestable without a live database. Services and
  models here take `db` as a parameter, and `db.js` resolves it lazily for the route layer.
- `hasPermission()` in `common/middleware/permission.middleware.js` reads `req.user.role_id`, which
  `authenticateToken` deletes, so it can never pass. `screening.permissions.js` checks
  `req.user.permissions` instead (honouring `*`/`all` wildcards) and adds brand scoping. Fixing the
  shared middleware is a separate change with a much wider blast radius.

The on-disk `moderation.controller.js` imports a nonexistent `../../../config/compliance` and a
nonexistent `createModeratedSubmission`, and ends with two clobbering `module.exports =`
assignments. It cannot load. Rewrite it; keep `models/moderation.model.js` (`ModerationQueue`),
which is correct.

## Pipeline trigger

Hook into `ArtworkController.createArtwork` AFTER the S3 upload + artwork insert succeed:
set `moderation_status='pending'`, `status='moderation_pending'`, create screening_run, enqueue.
Contest entry creation likewise enqueues with `contest_entry_id` set. Keep the hook to ~5 lines
calling `screening.service.js` — do not inline pipeline logic into the artwork controller.

## API surface

```
GET  /api/screening/runs/:artworkId     # screening history for an artwork
POST /api/screening/runs                # manual (re)screen: { artworkId, contestEntryId? }
GET  /api/screening/rulesets            # brand-scoped; falls back to platform default
POST /api/screening/rulesets            # new immutable version
POST /api/screening/style-guides        # multipart upload via existing singleUpload middleware

GET  /api/moderation/queue              # review queue; filters: status, entity_type, brand
POST /api/moderation/queue/:id/resolve  # { decision: approved|rejected|escalated, notes }
GET  /api/moderation/metrics            # computed on read from screening_runs + moderation_queue
```
`POST /api/moderation/submit` stays reserved for the existing user-reporting contract in
`moderationApi.ts` — do not repurpose it for rescreening; that is `POST /api/screening/runs`.

Response shape: match the loose existing style (`{ success, message, ...payload }` on writes,
bare objects/lists on reads) — do not introduce a new envelope convention mid-codebase.

## Testing (scoped to this module only)

- `vitest` is the runner for NEW code. The pre-existing `backend/tests/` suites use `node:test`,
  which vitest cannot execute, so the two runners coexist: `npm run test:unit` (vitest, scoped by
  `vitest.config.js` `include` to the new module) and `npm run test:node` (the old suites).
  `npm test` runs both.
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

**Phase 2 — real adapters:** retries/DLQ, creator notification via existing notifications module +
SendGrid template. Exit: real image, real verdict; kill worker mid-run, retry resumes at the
incomplete stage. Verified provider contracts (do not re-guess these):

- **AIORNOT:** `POST https://api.aiornot.com/v2/image/sync`, `Authorization: Bearer $AIORNOT_API_KEY`,
  `multipart/form-data` field `image`. Query params `only` / `excluding` / `external_id`; valid
  report names are `ai_generated`, `deepfake`, `nsfw`, `quality`, `reverse_search` (`ai_generated`
  and `deepfake` are separately billed). Max 50MB; jpg/jpeg/png/webp/heic/heif/tiff. Response:
  `{ id, created_at, external_id, report: { ai_generated: { verdict: 'ai'|'human'|'unknown',
  ai: { is_detected, confidence }, human: { is_detected, confidence },
  generator: { <name>: { is_detected, confidence } } }, nsfw, quality, deepfake, meta } }`.
  Their docs state `verdict` is more reliable than thresholding `confidence` yourself, because
  confidence drifts as they retrain. Treat `verdict` as primary; use `human.confidence` only for
  the borderline band.
- **OpenAI moderation:** model `omni-moderation-latest`, free, image cap 20MB. Returns `flagged`,
  `categories`, `category_scores`, `category_applied_input_types`. **Images are only scored for
  `sexual`, `self-harm`, `self-harm/intent`, `self-harm/instructions`, `violence`,
  `violence/graphic`.** All other categories (`harassment*`, `hate*`, `illicit*`, `sexual/minors`)
  are text-only and return 0 on image-only input — do not build rules that assume otherwise.
- **Copyright / IP is NOT an OpenAI moderation category.** The requirement doc's "copyrighted
  materials" check cannot come from the moderation endpoint. It belongs to the Stage C vision
  classifier (`style.adapter.js`), which returns an explicit `ip_risk`.

**Phase 3 — brand config + review:** ruleset versioning API mapped to compliance UI field names;
style guide upload + one-time parse job compiling `prompt_block`; style stage (including `ip_risk`);
wire `/api/moderation` queue + resolve endpoints with real permission checks.
Exit: brand edits thresholds → new version; flagged artwork resolved by a human; override visible
in audited_events. **No frontend or dashboard work — backend APIs only.**

**Phase 4 — metrics + hardening:** `/metrics` computed queries (add indexes on
`screening_runs.artwork_id`, `moderation_queue.status` as needed); per-artist submission rate
limit reusing `express-rate-limit`; sha256 dedupe (new `file_sha256` column on artworks) flagging
resubmission of rejected images; `POST /api/screening/runs` rescreen path. Exit: 200 artworks
in 10 min locally, zero stuck runs.

Do not start a later phase early. At each phase exit, stop and report with raw evidence.

## Known repo hazards (do not "helpfully" fix unless asked; do not replicate)

- Committed Firebase service-account JSON in `backend/` — flag it, never commit new secrets.
- `/api/admin/*` and `/api/roles` lack role checks — do not copy that pattern.
- Dual npm/pnpm lockfiles — use npm, don't delete anything without asking.
- `Dockerfile` says `EXPOSE 3000`, app binds 5000 — harmless, leave it unless asked.
- Role name constants in code don't match DB seed data — use `hasPermission()` (data-driven),
  avoid hardcoded role-name checks in new code.
