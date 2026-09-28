# Existing State — Architecture Reference

Audit date: 2026-07-13. Scope: entire repo (`backend/`, `backend-v2/`, `frontend/`, `dashboard/`, root).
Purpose: ground truth for planning an AI artwork-screening pipeline integration (authenticity check,
content moderation, brand style compliance, rule-based decision engine, human review queue, dashboards).

**Headline fact that shapes everything below: there are two backends.** `backend/` is a plain
Express 5 + Kysely app, has the only working CI/CD pipeline, is the only backend the frontend and
dashboard actually call (`http://localhost:5000/api` / `https://api.modfanofficial.com/api`), and is
where the real (if messy) data lives. `backend-v2/` is an in-progress NestJS + TypeORM rewrite that
**does not currently compile** (missing dependencies, duplicate identifiers, unimported symbols,
methods called that don't exist) and has no Dockerfile, no CI, and no migrations. Unless stated
otherwise, "the backend" below means `backend/` (v1). `backend-v2/` is covered separately in each
section because it may still be the intended long-term target.

---

## 1. Stack & tooling

### backend/ (v1 — live, deployed)

Node/Express, plain JavaScript (not TypeScript), from `backend/package.json`:
- `"express": "^5.2.1"`
- ORM/query layer: **Kysely** `"kysely": "^0.28.9"` (query builder, not a full ORM) over `"pg": "^8.16.3"` (raw `Pool`)
- Auth-adjacent: `"jsonwebtoken": "^9.0.3"`, `"firebase-admin": "^11.11.1"` (Firebase is the *actual* auth mechanism, see §4), `"bcryptjs": "^3.0.3"`
- Uploads: `"multer": "^2.0.2"`
- Storage: `"@aws-sdk/client-s3": "^3.962.0"` (active) and `"@vercel/blob": "^2.0.0"` (dead code, unused, see §2)
- Payments/PDF/email: `"stripe": "^20.3.1"`, `"pdfkit": "^0.17.2"`, `"@sendgrid/mail": "^8.1.6"`
- Validation: `"zod": "^4.3.5"` is a declared dependency but **grep across the entire codebase returns zero usages** — it is not actually used anywhere.
- Other: `"express-rate-limit": "^8.2.1"`, `"date-fns": "^4.1.0"`, `"node-fetch": "^3.3.2"`, `"uuid": "^13.0.0"`, `"ssh2-sftp-client": "^12.1.1"` (no callers found, likely dead), `"module-alias": "^2.3.4"` (no `_moduleAliases` config found, likely dead)
- devDependencies: `typescript ^5.9.3`, `ts-node`, `tsx` — present but the app itself runs as plain JS (`node index.js`); TS tooling appears used only for the migration script's intended `.ts` path (see §1 Migrations below, which doesn't actually exist).
- **No `engines` field** — Node version NOT PRESENT/unpinned.
- **No test framework** at all — no jest/mocha/vitest in devDependencies, no `"test"` npm script, zero `*.test.js`/`*.spec.js` files anywhere under `backend/`.

Package manager: **ambiguous**. Both `backend/package-lock.json` (npm) and `backend/pnpm-lock.yaml` + `pnpm-workspace.yaml` (pnpm) exist simultaneously; the pnpm files have the newest mtime, but `backend/Dockerfile` still runs `npm install` — a real mismatch, not just clutter.

**Migrations**: npm scripts point at a file that doesn't exist.
```
"migrate": "tsx src/scripts/migrate.ts",
"migrate:up": "tsx src/scripts/migrate.ts",
"migrate:latest": "tsx src/scripts/migrate.ts",
"db:migrate": "tsx src/scripts/migrate.ts",
"migrate:status": "tsx src/scripts/migrate.ts --status",
```
(`backend/package.json:6-15`) — but the file that exists on disk is `backend/src/scripts/migrate.js` (plain JS), not `migrate.ts`. Running these scripts as written would fail.

`migrate.js` (`backend/src/scripts/migrate.js:1-11`) is a Kysely `FileMigrationProvider` CLI pointed at `src/migrations/`. **`backend/src/migrations/` does not exist in this checkout** — `find` confirms zero migration files anywhere under `backend/`. The only DDL artifact in the entire repo is a Postgres dump at the repo root, `mod_dev_test_backup.sql` (outside `backend/`), whose embedded `kysely_migration` table lists 7 migration names (e.g. `202601060001_extensions_and_core` … `202601190001_extensions_and_core`) that correspond to no files anywhere in this checkout — they must have existed on some other machine/branch. **Conclusion: there is currently no way to run or regenerate this schema from the repo as checked out.** All of §3 (data model) below is reconstructed from that dump, cross-checked against JSDoc typedefs in `backend/src/db/types.js` and live Kysely query code — not from authoritative migration files.

**Redis / queue**: NOT PRESENT. No `redis`/`ioredis`, no `bull`/`bullmq`/`bee-queue`/`agenda`/`node-cron`. The only "cache" is an in-process `Map` with TTL (`backend/src/cache.js:1-27`) — no persistence, no cross-process sharing, not a substitute for Redis.

**Object/file storage**: Two parallel, non-identical code paths exist; only one is wired up.
- **Active**: AWS S3 via `backend/src/modules/cdn/services/cdn-file.service.js`. Files land on local disk first via Multer (`backend/src/common/middleware/upload.js`, disk storage into `TEMP_UPLOAD_DIR`, default `/tmp/cdn_uploads`, 500MB limit), then `CDNFileService.uploadToCDN` pushes to S3 (`Bucket: process.env.S3_BUCKET_NAME`, `Key: ${S3_KEY_PREFIX}/${remoteFilename}`) and the local temp file is deleted. This is what `POST /api/artwork` actually uses (confirmed by S3 URLs in the dump, e.g. `https://amzn-artwork-images.s3.eu-north-1.amazonaws.com/...`).
- **Dead**: `backend/src/common/services/storage.js` wraps `@vercel/blob` (`put`/`del`/`list`/`head`, 20MB limit, `folder: "submissions"` default). Grep finds **zero callers** anywhere in `backend/src` — not wired to any route.
- A third, also-unused config file, `backend/src/config/cdn.config.js`, defines yet another set of env var names (`CDN_PROVIDER`, `CDN_ACCESS_KEY`, `CDN_BUCKET`, etc.) that don't match what `cdn-file.service.js` actually reads (`AWS_REGION`, `S3_BUCKET_NAME`, `S3_KEY_PREFIX`) — never `require`d anywhere.

**Tests**: NOT PRESENT.

**Build/deploy**: `backend/Dockerfile` (verbatim):
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
Facts: base image `node:18` (not alpine); installs via `npm install` despite the pnpm lockfiles also present; `EXPOSE 3000` is **wrong** — the app actually hardcodes `const PORT = 5000` and binds `0.0.0.0:5000` (`backend/index.js:138,140`), and the deploy workflow correctly maps port 5000 (below), so the Dockerfile's `EXPOSE` line is stale.

No `docker-compose*.yml` exists anywhere in the repo. No Coolify config exists anywhere.

CI/CD: `.github/workflows/backend-workflow.yaml` — the **only** GitHub Actions workflow in the repo, and it only covers `backend/` (`paths: ["backend/**"]`). Builds `./backend` into `ghcr.io/modfanart/modfanart-backend:latest`, pushes to GHCR, then SSHes into a VPS and runs:
```
docker run -d --name modfanart-backend --restart unless-stopped \
  --network mod-network -p 5000:5000 \
  --env-file /opt/dev/apps/modfanart-backend/.env \
  ghcr.io/modfanart/modfanart-backend:latest
```
No lint/test step runs before build. This is a raw Docker/SSH deploy to a self-managed VPS — **not** Coolify, **not** docker-compose. `frontend/` and `dashboard/` have no CI/CD workflow at all.

### backend-v2/ (in-progress rewrite — not deployed)

From `backend-v2/package.json`: `@nestjs/common`/`core`/`platform-express`/`typeorm` `^11.0.1`, `typeorm ^0.3.28`, `pg ^8.20.0`, `class-validator ^0.15.1`, `class-transformer ^0.5.1`, `jest ^30.0.0` (devDependency, boilerplate tests only — see below). No `engines` field. npm-only (no pnpm lockfile).

**Critical: the code imports packages that are not installed.** `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `passport`, `bcryptjs`, `stripe`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@nestjs/mapped-types`, `kysely`/`nestjs-kysely`, `pdfkit`, and a direct `multer` dependency are all referenced in source but **absent from `package.json` and `package-lock.json`**. The project cannot currently `npm install && nest build` successfully.

**Migrations**: NOT PRESENT. No migration files, no `typeorm`/`migration:*` npm scripts. `AppModule`'s TypeORM config points `migrations` at `src/database/migrations/*{.ts,.js}` (`backend-v2/src/app.module.ts:47`) — that directory does not exist. Schema is driven entirely by `synchronize: configService.get('NODE_ENV') === 'development'` (`app.module.ts:45`) — i.e. TypeORM auto-syncs entity definitions straight to the DB in dev, and nothing runs migrations in any other environment because there are none to run. **Entity files are the only schema source of truth for v2, and they have never been migrated anywhere.**

**Redis/queue**: NOT PRESENT.

**Storage**: `src/common/services/s3.service.ts` implements upload/delete/signed-url/public-url methods against S3, but its SDK dependency isn't installed (above), and its only caller, `ArtworksService.create`, references unimported `crypto`/`path` — would fail to compile.

**Tests**: Jest configured (`package.json` embedded config + `test/jest-e2e.json`), but the only spec files that exist are the NestJS-generated boilerplate: `src/app.controller.spec.ts` and `test/app.e2e-spec.ts`, both testing the default "Hello World" endpoint. **Zero tests for any real module.**

**Build/deploy**: No Dockerfile in `backend-v2/`. No docker-compose. No CI workflow references it. Not wired into any deploy path.

---

## 2. Directory & module layout

### backend/ (v1)

```
backend/
├── index.js                — entrypoint; route-mount table; global error handler; hardcoded PORT=5000
├── Dockerfile, .dockerignore, .env, .eslintrc.js, .prettierrc
├── modfanart-firebase-adminsdk-fbsvc-*.json   — Firebase Admin service-account key, committed to the repo
├── public/                 — static assets served via express.static
└── src/
    ├── cache.js             — in-memory Map cache (§1)
    ├── config/
    │   ├── index.js          — Kysely + pg Pool setup, reads DATABASE_URL/DB_SSL
    │   ├── firebase.js, stripe.js, sendgrid.js
    │   └── cdn.config.js     — unused (§1)
    ├── db/
    │   ├── types.js          — JSDoc @typedef schema documentation (not enforced; some tables here have no matching DDL, §3)
    │   └── _base.model.js    — unused optional base-model helper
    ├── scripts/migrate.js    — Kysely migration CLI (§1)
    ├── repository/submission.repository.js
    ├── common/
    │   ├── middleware/       — auth.middleware.js, permission.middleware.js, brand.middleware.js, upload.js, error.js, rate-limit.js, requestLogger.js, attachDb.js (unused)
    │   ├── services/storage.js  — unused Vercel Blob wrapper (§1)
    │   ├── emails/, templates/, utils/ (dbHelpers, logger, password, pdfGenerators)
    └── modules/               — one folder per domain
        ├── admin/            — wired at /api/admin (no role check applied, §4)
        ├── artworks/         — wired at /api/artwork, /api/category (favorite.routes.js exists but NOT mounted anywhere)
        ├── audit/            — NOT wired into index.js
        ├── auth/             — wired at /api/auth (two duplicate controller files, one dead — §4)
        ├── brands/           — wired at /api/brands
        ├── cdn/              — wired at /api/media
        ├── collections/      — wired at /api/collections
        ├── contests/         — wired at /api/contest
        ├── licenses/         — wired at /api/order, /api/licenses, /api/payout
        ├── moderation/       — NOT wired into index.js
        ├── notifications/    — wired at /api/notifications
        ├── queries/          — wired at /api/contact (no auth middleware on any route)
        ├── rbac/              — wired at /api/roles (auth middleware imported but never applied — unauthenticated)
        ├── search/           — wired at /api/search
        ├── tags/             — wired at /api/tags
        ├── tasks/            — wired at /api/tasks, /api/projects
        └── users/            — wired at /api/users
```

Routes/controllers live in `src/modules/<domain>/controller/` (or flat `<domain>.controller.js` in some modules — inconsistent, see §5). Business logic mostly lives directly in controllers (there is no separate "services" layer in most modules — see §5 request-flow walkthrough). DB access lives in `src/modules/<domain>/models/` (PascalCase classes with `static async` Kysely query methods) and `src/repository/` (one file, `submission.repository.js`). Shared config/env loading lives in `src/config/index.js` (Kysely/pg setup) plus per-integration files (`firebase.js`, `stripe.js`, `sendgrid.js`).

**Env loading**: `dotenv.config()` is called twice — once at the very top of `backend/index.js:13` and again independently inside `backend/src/config/index.js:1`. Harmless but redundant.

**Full list of env var NAMES referenced in code** (via `process.env.*` grep across `backend/src`):
```
ADMIN_EMAIL, APP_NAME, AWS_REGION, CDN_ACCESS_KEY, CDN_BASE_URL, CDN_BUCKET,
CDN_PROVIDER, CDN_REGION, CDN_SECRET_KEY, DATABASE_URL, DB_SSL,
FIREBASE_SERVICE_ACCOUNT, FRONTEND_URL, JWT_SECRET, NODE_ENV, S3_BUCKET_NAME,
S3_KEY_PREFIX, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, STRIPE_SECRET_KEY,
STRIPE_WEBHOOK_SECRET, TEMP_UPLOAD_DIR, GOOGLE_APPLICATION_CREDENTIALS
```
`PORT` is **not** read from env — it's hardcoded to `5000` in `index.js:138`. The committed `backend/.env` file itself contains only one variable (`GOOGLE_APPLICATION_CREDENTIALS`) — every other var above must be supplied at deploy time via the CI workflow's `--env-file`.

The root `.env` file (repo root, distinct from `backend/.env`) contains a different, larger set: `STRIPE_SECRET_KEY, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, AWS_ACCESS_KEY_ID, S3_BUCKET_NAME, AWS_SECRET_ACCESS_KEY, AWS_REGION, JWT_SECRET, EC2_HOST, EC2_USER, NODE_ENV, DATABASE_URL, GOOGLE_APPLICATION_CREDENTIALS`.

### backend-v2/ (NestJS)

```
src/
├── app.controller.ts / app.module.ts / app.service.ts / main.ts   — boilerplate, mostly untouched
├── common/
│   ├── decorators/role.decorator.ts
│   ├── guards/brand-access.guard.ts, jwt-auth.guard.ts, jwt-strategy.ts
│   ├── services/s3.service.ts, stripe.service.ts
│   └── utils/db-helpers.util.ts, jwt.util.ts, password.util.ts
└── modules/
    ├── artworks/, auth/, brands/, categories/ (entity-only, no controller/service/module),
    │ collections/, contests/, notifications/, orders/, rbac/, search/, tags/, users/
    (each with controller + service + module + dto/ + entities/, except categories/)
```
Env loading: `ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env','.env.local','.env.development','.env.production'] })` (`src/app.module.ts:22-30`). Env vars referenced: `PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, NODE_ENV, DB_SSL, JWT_SECRET, AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, FRONTEND_URL, STRIPE_SECRET_KEY, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SIGNUP_KEY`. No `.env`/`.env.example` file exists in `backend-v2/`.

**Per-module completion state in backend-v2** (read from actual service code, not inferred):

| Module | State |
|---|---|
| `notifications` | Fully implemented CRUD, no compile issues found |
| `tags` | Fully implemented CRUD, no compile issues found |
| `users` | Partial — `uploadAvatar` and `getAllUsers` are comment-only stubs |
| `rbac` | Partial — `UserRole` entity file is **completely empty (0 bytes)**; role assignment is actually a single FK on `User`, not many-to-many |
| `artworks` | Partial, **compile-breaking** — duplicate `artworkRepo` constructor param, unimported `crypto`/`path`/`In` |
| `brands` | Partial, **compile-breaking** — controller calls `updateBrand`/`softDelete` methods that don't exist on the service |
| `collections` | Partial, **compile-breaking** — `addItem`/`removeItem` use an uninjected repo and unimported symbols |
| `contests` | Mostly stubs — `create`, `getContestsByStatus` empty; controller calls `getContests()`, which doesn't exist on the service |
| `orders` | Mostly stubs, plus a literal **syntax error** (`orders.service.ts:50`, dangling `!` operator) |
| `search` | **Architecturally broken** — imports `nestjs-kysely`/`kysely`/`../../db/types`, none of which exist in this repo or its dependencies; doesn't use TypeORM at all; looks pasted in from a different codebase |
| `auth` | Partial, broken JWT wiring (§4) |
| `admin`, `audit`, `cdn/storage` (as a module), `moderation`, `contact/queries`, `payout`, `tasks/projects` | **NOT PRESENT** — no folder, no controller/service, confirmed by directory listing |

### frontend/ (Next.js) and dashboard/ (Vite/React) — brief, see §5/§6 for detail

- `frontend/app` — App Router, route groups for auth, dashboard (artist/brand-manager/judge), explore, gallery, storefront, and a standalone `compliance/` section (not a route group — a real `/compliance` URL).
- `frontend/services/api/*.ts` — ~19 RTK Query API slices, one per backend domain, all built on a single shared `API_BASE_URL` constant.
- `frontend/lib` — includes `ai/`, `db/` (storage, motherduck, models, repositories), `edge-config.ts`, `services/moderation-service.ts`.
- `dashboard/src/concepts/*` — one folder per admin page (artists, brands, opportunities, submissions, judges, licensing, projects, team-permissions, queries, reports, settings). `dashboard/src/router/routes/sidebarRoutes.jsx` already has a **commented-out** `/review-automation` sidebar entry.

**Not a monorepo.** No root `pnpm-workspace.yaml`, no `workspaces` field in root `package.json`. `frontend/`, `backend/`, `backend-v2/`, `dashboard/` are four independently-installed Node projects sharing one git repo, each with its own (sometimes dual npm+pnpm) lockfile.

---

## 3. Data model

**Source of truth caveat (repeated because it matters for every claim below)**: no migration files exist in this repo for either backend. Everything in this section for backend v1 is reconstructed from `mod_dev_test_backup.sql` (a `pg_dump`, repo root), cross-checked against `backend/src/db/types.js` (JSDoc, not enforced) and live Kysely query code. For backend v2, entities are read directly from `*.entity.ts` files, but those have never been migrated to any real database (`synchronize: true` in dev only) — they represent *intent*, not a proven-running schema.

**Primary key strategy**: UUID everywhere in both backends (`uuid DEFAULT gen_random_uuid()` / `@PrimaryGeneratedColumn('uuid')`). No serial/auto-increment integer PKs anywhere. Pure join tables use composite PKs on the FK columns (no surrogate id) in both backends.

**Soft-delete pattern**: a plain nullable `deleted_at timestamp` column, present on `artworks`, `brands`, `brand_posts`, `brand_post_comments`, `contests`, `users` in the v1 dump, and mirrored on the same entities in v2 (`Artwork`, `Brand`, `BrandPost`, `BrandPostComment`, `Contest`, `User`). **Not** a TypeORM `@DeleteDateColumn` in v2 — it's a plain `@Column()`, so TypeORM's native soft-delete API (`softDelete()`/`restore()`) is not usable; deletion is manually coded in service methods on both backends. No `is_deleted` boolean pattern is used anywhere.

**Audit log**: one dedicated table, `audited_events` (v1 dump only, `mod_dev_test_backup.sql:171-182`) — `actor_id`, `action`, `entity_type`/`entity_id`, `old_values jsonb`, `new_values jsonb`, `ip_address`, `user_agent`, `created_at`. No `updated_at` (append-only, as expected for an audit log). **No equivalent entity exists in backend-v2** — the `audit` module there is NOT PRESENT.

### Tables in backend v1 (from the SQL dump — 35 `CREATE TABLE` statements total)

**users** (`mod_dev_test_backup.sql:756-778`) — core account.
`id uuid PK` · `username text UNIQUE NOT NULL` · `email citext UNIQUE NOT NULL` (case-insensitive) · `email_verified boolean DEFAULT false` · `password_hash text` (nullable — OAuth accounts) · `role_id uuid FK→roles(id) ON DELETE SET NULL` · `status text NOT NULL CHECK IN ('active','suspended','pending_verification','deactivated')` · `profile jsonb DEFAULT '{}'` · `avatar_url, banner_url, bio, location, website` · `payout_method jsonb, stripe_connect_id` · `signup_key_used text` · `last_login_at` · `created_at/updated_at timestamptz NOT NULL DEFAULT now()` · `deleted_at` (soft delete).
Note: the dump has **no `firebase_uid` column**, yet live auth code (`auth.middleware.js:29`, `auth.controller.js`, `types.js:19`) queries/assumes `users.firebase_uid` exists — direct evidence the dump is stale relative to what the running app expects.

**roles** (`:671-681`) — `id, name UNIQUE, hierarchy_level int, is_system boolean DEFAULT false, permissions jsonb DEFAULT '{}' NOT NULL, created_at`. Seed rows mix casing inconsistently: `user` (10), `admin` (90), `Admin` (100), `Artist` (10), `Brand` (50).

**user_roles** (`:720-728`) — many-to-many join, composite PK `(user_id, role_id)`, `assigned_by FK→users(id)`.

**auth_tokens** (`:191-200`) — email verification / password reset. `user_id FK CASCADE, type CHECK IN ('email_verification','password_reset'), token_hash, expires_at, used_at, created_at`.

**refresh_tokens** (`:636-643`) — `user_id FK CASCADE, token_hash, expires_at, created_at, revoked_at`.

**artworks** (`:143-162`) — **artwork/image table.**
`id PK` · `creator_id uuid NOT NULL FK→users(id) CASCADE` (**ownership**) · `title NOT NULL, description` · `file_url NOT NULL, thumbnail_url, source_file_url` · `status text NOT NULL CHECK IN ('draft','published','archived','moderation_pending','rejected')` (**status**) · `moderation_status text NOT NULL DEFAULT 'pending'` (**status**), `moderation_notes, moderated_by FK→users(id), moderated_at` (**moderation/audit columns already present**) · `views_count, favorites_count DEFAULT 0` · `created_at/updated_at` (**timestamps**) · `deleted_at` (soft delete).

**artwork_categories** (`:113-116`) — join, composite PK `(artwork_id, category_id)`.

**artwork_pricing_tiers** (`:125-134`) — `id PK, artwork_id FK CASCADE, license_type CHECK IN ('personal','commercial','exclusive'), price_inr_cents, price_usd_cents, is_active DEFAULT true, created_at`.

**categories** (`:355-366`) — `id, name, slug UNIQUE, parent_id self-FK ON DELETE SET NULL, description, icon_url, sort_order, is_active, timestamps`. Has **two redundant UNIQUE constraints on `slug`** (`categories_slug_key` and `categories_slug_unique`).

**tags** (`:702-711`) — `id, name, slug UNIQUE, approved DEFAULT false, usage_count DEFAULT 0, created_by/approved_by FK→users(id), created_at`.

**taggings** (`:687-696`) — polymorphic. Composite PK `(tag_id, taggable_type, taggable_id)`; `taggable_type` is a free-text discriminator with no DB-level enum/check.

**brands** (`:329-346`) — **brand table.**
`id PK` · `user_id uuid NOT NULL FK→users(id) CASCADE` (**ownership**) · `name, slug UNIQUE, description, logo_url, banner_url, website` · `social_links jsonb DEFAULT '{}'` · `status text NOT NULL DEFAULT 'pending' CHECK IN ('active','suspended','pending','deactivated')` (**status**) · `verification_request_id FK→brand_verification_requests(id) ON DELETE SET NULL` · `followers_count DEFAULT 0` · `created_at/updated_at` (**timestamps**) · `deleted_at` (soft delete).

**brand_verification_requests** (`:307-320`) — moderation-style table for brand onboarding. `id, user_id FK CASCADE, company_name NOT NULL, website, documents jsonb, status text NOT NULL CHECK IN ('pending','approved','rejected','interview_scheduled')` (**status**) · `reviewed_by FK→users(id), reviewed_at, notes, timestamps`.

**brand_artworks** (`:209-215`) — composite PK `(brand_id, artwork_id)`, `is_featured, sort_order, added_at`.

**brand_followers** (`:224-228`) — composite PK `(brand_id, user_id)`, `followed_at`.

**brand_posts** (`:283-298`) — `id, brand_id FK CASCADE, title NOT NULL, content, media_urls jsonb DEFAULT '[]', status text NOT NULL DEFAULT 'draft' CHECK IN ('draft','published','archived'), is_pinned, likes_count/comments_count/upvotes_count DEFAULT 0, timestamps, deleted_at`. Has an `updated_at` auto-touch trigger.

**brand_post_comments** (`:237-247`) — `id, post_id FK CASCADE, user_id FK CASCADE, parent_id self-FK CASCADE (threaded), content NOT NULL, likes_count, timestamps, deleted_at`. Also has an auto-touch trigger.

**brand_post_likes** / **brand_post_upvotes** (`:256-277`) — composite-PK `(post_id, user_id)` joins; upvotes adds `vote_weight DEFAULT 1`.

**contests** (`:455-478`) — **contest table.**
`id PK` · `brand_id uuid NOT NULL` — **its FK constraint actually references `users(id)`, not `brands(id)`** (`contests_brand_id_fkey`, `:1917-1918`) despite the column name and every controller treating it as the owning brand — a genuine naming/FK mismatch in the live schema · `title, slug UNIQUE, description NOT NULL, rules, prizes jsonb` · `start_date/submission_end_date NOT NULL, voting_end_date, judging_end_date` · `status text NOT NULL CHECK IN ('draft','published','live','judging','completed','archived')` (**status**) · `visibility CHECK IN ('public','private','unlisted')` · `max_entries_per_user NOT NULL, entry_requirements jsonb, judging_criteria jsonb` · `winner_announced DEFAULT false` · `timestamps + deleted_at` (soft delete).

**contest_categories** (`:375-378`) — composite PK `(contest_id, category_id)`.

**contest_entries** (`:387-403`) — **this is the existing "submission" table.**
`id PK` · `contest_id FK CASCADE, artwork_id FK CASCADE, creator_id uuid NOT NULL FK→users(id) CASCADE` (**ownership**) · `submission_notes text` · `status text NOT NULL CHECK IN ('pending','approved','rejected','disqualified','winner')` (**status**) · `rank, score_public DEFAULT 0, score_judge DEFAULT 0` · `moderation_status text NOT NULL DEFAULT 'pending', moderated_by FK→users(id), moderated_at` (**moderation columns already present**) · `timestamps` (no soft delete on this table).

**contest_judges** (`:427-432`) — composite PK `(contest_id, judge_id)`, `invited_by FK→users(id), accepted DEFAULT false`.

**contest_judge_scores** (`:412-418`) — composite PK `(entry_id, judge_id)`, `score int NOT NULL, comments, created_at`.

**contest_votes** (`:441-446`) — composite PK `(entry_id, user_id)`, `vote_weight int NOT NULL, created_at`.

**orders** (`:604-627`) — **order table.**
`id PK` · `order_number UNIQUE NOT NULL` · `buyer_id FK→users(id)` (nullable, **ownership**) · `seller_id uuid NOT NULL FK→users(id)` · `source_type text NOT NULL CHECK IN ('license_purchase','contest_prize','refund','manual')` · `source_id uuid` · `status text NOT NULL CHECK IN ('pending','paid','fulfilled','refunded','disputed','failed')` (**status**) · `currency, subtotal_cents/platform_fee_cents/tax_cents/total_cents int NOT NULL` · `stripe_payment_intent_id, stripe_charge_id, invoice_pdf_url, invoice_number` · `paid_at, fulfilled_at, timestamps` (no soft delete).

**order_items** (`:586-595`) — `id, order_id FK CASCADE, artwork_id FK→artworks(id) (no cascade), license_type, unit_price_cents NOT NULL, quantity DEFAULT 1, description, metadata jsonb`.

**licenses** (`:525-537`) — `id, order_item_id FK CASCADE, artwork_id FK CASCADE, buyer_id/seller_id NOT NULL FK→users(id)` (**ownership**) · `license_type NOT NULL, contract_pdf_url NOT NULL` · `expires_at, is_active DEFAULT true, revoked_at` · `created_at` only (no `updated_at`, no soft delete).

**refunds** (`:652-662`) — `id, order_id FK CASCADE, amount_cents NOT NULL, reason, status text NOT NULL` (**status**, no CHECK constraint) `, stripe_refund_id, approved_by FK→users(id), processed_at, created_at`.

**moderation_queue** (`:546-559`) — **already exists as a dedicated moderation table.**
`id PK` · `entity_type text NOT NULL` (polymorphic) `, entity_id uuid NOT NULL` · `status text NOT NULL` (**status**, no CHECK constraint) `, priority int DEFAULT 0` · `assigned_to/reviewed_by FK→users(id), reviewed_at` · `decision text, notes text, timestamps`.

**user_violations** (`:734-747`) — moderation/strike table. `id, user_id NOT NULL FK CASCADE` (**ownership** — offending user) `, reported_by FK→users(id), entity_type/entity_id polymorphic, violation_type NOT NULL, description, status text NOT NULL` (**status**, no CHECK) `, strike_issued DEFAULT false, resolved_by FK→users(id), resolved_at, created_at`.

**audited_events** (`:171-182`) — dedicated audit-log table, see above.

**notifications** (`:568-577`) — `id, user_id NOT NULL FK CASCADE, type NOT NULL, title NOT NULL, body, data jsonb, read_at, created_at`.

**favorites** (`:487-492`) — polymorphic. Composite PK `(user_id, favoritable_type, favoritable_id)`, `created_at`.

**kysely_migration / kysely_migration_lock** (`:501-519`) — Kysely's own bookkeeping tables.

**Indexes found** (`:1555-1593`): `artworks_creator_id_idx`, `brand_posts_brand_id_idx`, `brand_posts_status_idx`, `brands_slug_idx`, `brands_user_id_idx`, `users_email_idx`. No explicit index on `contest_entries.contest_id`, `orders.buyer_id`, `licenses.artwork_id`, etc. beyond what Postgres creates implicitly for PK/UNIQUE constraints.

**Triggers**: `update_updated_at_column()` is wired only to `brand_post_comments`, `brand_posts`, `brands`. Every other table with `updated_at` (e.g. `artworks`, `contests`, `orders`, `contest_entries`) relies on application code to set it manually — confirmed inconsistent in practice (`artwork.model.js:70` sets it manually).

**Tables referenced only in application code / `db/types.js`, with NO matching DDL anywhere in the repo** — these are live (models/controllers reference them and code actually runs against them in production, per module wiring in §2), but their exact column-level constraints cannot be verified from any file in this checkout: `brand_managers`, `collections`, `collection_items`, `projects`/`project_members`/`tasks`/`task_comments`/`task_attachments`/`task_activity_log`/`task_watchers`/`subtasks`, `cdn_files`, `contact_messages`, `artwork_likes` (documented in `types.js` but `favorites` appears to be the actual mechanism used).

### Entities in backend-v2 (30 `*.entity.ts` files — unmigrated, dev-only `synchronize`)

Mirrors the v1 shape closely with the same table names, but with these material differences worth flagging for integration planning:
- `UserRole` entity (`src/modules/rbac/entities/user-role.entity.ts`) is a **completely empty file** — v2 has abandoned the many-to-many role model in favor of a single `role_id` FK on `User`, same as v1's data actually behaves in practice even though a `user_roles` join table exists in the v1 DDL.
- All status/moderation columns in v2 entities are plain unconstrained `string` `@Column()`s — no `@Column({type:'enum'})`, no TS enum used anywhere; valid values live only in code comments.
- `Contest` entity references `ContestCategory`/`ContestEntry`/`ContestJudge` and uses `OneToMany` without importing any of them (`contest.entity.ts`) — would fail TypeScript compilation.
- `License` entity's `order_item_id`/`artwork_id`/`buyer_id`/`seller_id` are plain string columns, not real relations, yet service code (`orders.service.ts:41`) requests a `relations: ['orderItem']` that doesn't exist on the entity.
- `BrandVerificationRequest` entity exists and is injected into `BrandsService`, but **no service method ever reads or writes it** — it's an unused table in v2's actual code path today.

### Explicit collision flags (tables representing users / artists / brands / artwork / contests / submissions / orders / moderation)

| Concept | v1 table | v2 entity/table |
|---|---|---|
| Users | `users` | `User` / `users` |
| Artists | no separate table — `users.role` distinguishes artist accounts | same |
| Brands | `brands` (+ `brand_managers`, code-only) | `Brand` / `brands` (+ `BrandManager`) |
| Artwork/images | `artworks` | `Artwork` / `artworks` |
| Contests/exhibitions/collections | `contests`, `collections` (code-only schema) | `Contest`, `Collection` |
| Submissions/entries | `contest_entries` | `ContestEntry` / `contest_entries` |
| Orders/licenses | `orders`, `order_items`, `licenses` | `Order`, `OrderItem`, `License` |
| Moderation/status | `moderation_queue`, `user_violations`, plus `moderation_status` columns on `artworks` and `contest_entries` | `moderation_status` columns only on `Artwork`/`ContestEntry` — **no `moderation_queue`-equivalent entity exists in v2 at all** |
| Audit | `audited_events` | NOT PRESENT |

---

## 4. Auth & authorization

### backend/ (v1) — the live mechanism

**Firebase ID tokens, not self-issued JWT**, despite `jsonwebtoken` being a dependency. The wired middleware:

`backend/src/common/middleware/auth.middleware.js` (`authenticateToken`):
```js
const decoded = await admin.auth().verifyIdToken(token);
const user = await db.selectFrom('users as u').leftJoin('roles as r', ...)
  .where('u.firebase_uid', '=', decoded.uid)
  .where('u.status', '=', 'active')
  .where('u.deleted_at', 'is', null)
  .executeTakeFirst();
```
Bearer token read from `Authorization: Bearer <token>`, verified via Firebase Admin SDK, then matched to a local `users` row by `firebase_uid`. If no local user exists, the middleware 403s with `"User not found. Call /api/auth/sync first."` — clients must call `POST /api/auth/sync` first to create/link the local user row.

`authorize(allowedRoles)` (`auth.middleware.js:85-95`) is a simple string-allowlist middleware — used in exactly one place, `backend/src/modules/brands/brand.routes.js:36,43`.

**RBAC**: `backend/src/common/middleware/permission.middleware.js` — `hasPermission(permission)` / `hasAnyPermission(...)` check `role.permissions[permission] === true`, loaded live from the `roles.permissions` JSONB column. **There is no single canonical roles/permissions enum file** — role names and permissions are entirely data-driven from the DB. The closest thing to constants are inconsistent, scattered array literals:
```js
// auth.middleware.js:40-41
const BRAND_ROLES = ['BRAND_OWNER', 'BRAND_MANAGER', 'BRAND_EDITOR', 'BRAND_MEMBER'];
const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];
// auth.controller.js:7-11
const ACCOUNT_TYPE_ROLE_NAMES = { fan: 'DEFAULT_USER', artist: 'ARTIST', brand: 'BRAND_MANAGER' };
```
These names (`BRAND_OWNER`, `SUPERADMIN`, `DEFAULT_USER`, `ARTIST`) **do not match** the actual seed data in the DB dump (`user`, `admin`, `Admin`, `Artist`, `Brand`) — the role system is internally inconsistent right now.

**Dead auth code**: a duplicate, unwired `backend/src/modules/auth/auth.controller.js` (flat file, not the mounted one under `controller/`), and a fully-built but never-imported `backend/src/modules/auth/services/auth.service.js` implementing an entirely different email/password + JWT + Google OAuth flow against column names (`name`, `role`, `profile_image_url`) that don't match the real `users` table.

**Known access-control gaps** (facts, not hypotheticals):
- `/api/roles` (role CRUD + role assignment) — auth middleware imported but never applied to any route; fully unauthenticated.
- `/api/admin/*` — `authenticateToken` applied globally, but **no role/permission check layered on top** anywhere in the module; any authenticated active user (not just admins) can hit `GET /api/admin/stats`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`, `PATCH /api/admin/brands/:brandId/verify`, `GET /api/admin/moderation/queue`.
- `/api/contact` — no auth middleware at all on any route.
- `/api/order` — `authenticateToken` is present in the file but **commented out**; routes rely solely on `hasPermission()`, which needs `req.user` already set — since it never is, these endpoints always 401 (broken, not insecure).
- `artworks/favorite.routes.js` — auth commented out, and separately **not mounted anywhere** in `index.js` — simultaneously dead and would-be-unauthenticated.

### backend-v2/

Intended mechanism: JWT via `passport-jwt`. **Currently non-functional as wired**:
- `JwtStrategy` reads secret from `JWT_SECRET` (with fallback `'secretKey'`), but `AuthModule`'s `JwtModule.register` signs tokens with a *different* env var, `JWT_ACCESS_SECRET` — tokens signed by one would fail verification against the other unless both happen to be set identically.
- `AuthService.login` signs `{ userId: user.id }` only; `JwtStrategy.validate()` expects `payload.sub` — always `undefined`, so `req.user.id` would always be `undefined` for any successfully-authenticated request.
- `JwtStrategy` is **never registered as a Nest provider** anywhere (`grep` confirms no `providers: [JwtStrategy]` in any module) — `AuthGuard('jwt')` has no strategy bound to it; every `@UseGuards(JwtAuthGuard)` route would throw an "Unknown authentication strategy" error at runtime.
- Role/permission enums: NOT PRESENT as TypeScript enums — same free-string pattern as v1 (`@Roles('admin')`, `role.name` string comparisons). `RolesGuard.getMinHierarchy()` is a stub that always returns `0` (unimplemented, comment only).

---

## 5. Existing patterns & conventions

### Request flow — walked end to end (v1, `POST /api/artwork`, artwork creation)

1. **Mount** (`backend/index.js:104`): `{ path: "/api/artwork", module: "./src/modules/artworks/artwork.routes.js" }`.
2. **Route** (`artwork.routes.js:54-59`): `router.post("/", authenticateToken, singleUpload("file"), ArtworkController.createArtwork)` — Firebase auth, then Multer disk upload (500MB limit, MIME allowlist), then controller.
3. **Validation**: inline `if` checks directly in the controller (`artwork.controller.js:18-55`) — file presence, title required, a *file-extension* allowlist that differs from Multer's separate *MIME-type* allowlist (extension list includes `.svg`, MIME list doesn't include `image/svg+xml` — an inconsistency).
4. **Controller/"service"**: `artwork.controller.js:57-62` instantiates `CDNFileService` inline and calls it directly — there is no separate service layer between controller and DB access in this module; the controller *is* the orchestration layer.
5. **DB access**: `Artwork.create(userId, {...})` (`artwork.model.js:54-75`) — a Kysely `insertInto('artworks').values({...}).returningAll().executeTakeFirstOrThrow()`. Category assignment and pricing-tier inserts run afterward via `Promise.all`, **each individually wrapped in `.catch(console.error)`** — partial failures are silently swallowed, no DB transaction wraps the whole operation.
6. **Response**: `res.status(201).json({ success: true, message: "...", artwork: {...} })`.
7. **Errors**: caught locally in the controller's own `try/catch`, returned directly as `res.status(500).json({ error: ..., message: ... })` — the global error handler (`common/middleware/error.js`) is never reached in this path because the controller never calls `next(err)`.

**This pattern (controller = validation + orchestration + no service layer, models = thin Kysely wrappers) is representative of most of `backend/`** — there is no consistent controller → service → repository layering; some modules have a `services/` folder, most don't.

### Validation approach

`zod` is a declared dependency but **unused anywhere in the codebase** (v1). All validation observed is manual inline `if` statements inside controllers. No `express-validator`, no `joi`. (v2 uses `class-validator` DTOs extensively, but see §1 — no global `ValidationPipe` is registered, so in v2 those decorators are inert everywhere except `SearchController`, the one place that explicitly opts in with `@UsePipes(new ValidationPipe(...))`.)

### Error handling & response shape

v1 central handler, `backend/src/common/middleware/error.js` (full file):
```js
module.exports = (err, req, res, next) => {
  console.error('Global error handler:', err);
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
};
```
Registered last in `index.js`, but rarely actually hit — most controllers catch and respond directly (see request-flow walkthrough above).

**No consistent success/error envelope.** Observed variance in a single module (`artworks`): `createArtwork` returns `{ success: true, message, artwork }`; `getArtwork` returns the artwork object with no wrapper at all; list endpoints return `{ artworks: [...], pagination: {...} }`. Errors are almost universally `{ error: "<message>" }`, sometimes with extra fields (`permission.middleware.js` adds `required`, `your_permissions`). Global rate-limiting (`express-rate-limit`, 100 req/15min/IP) is the one place using a different, deliberately structured response: `{ status: 429, message: "..." }`.

v2 has no global exception filter and no custom `*.filter.ts` files — relies entirely on Nest's default `HttpException` handling with default JSON error shapes.

### Naming conventions

- DB columns: consistently `snake_case` in both backends' schemas.
- v1 API JSON bodies **mirror DB `snake_case` directly** rather than camelCasing at the API boundary (e.g. responses include `file_url`, `moderation_status`, `stripe_payment_intent_id` verbatim) — the one exception is the dead `auth.service.js`, which is not representative of the live API.
- v1 file naming is inconsistent: most route files are `<module>.routes.js` (plural) except `collections/collection.route.js` (singular); most module subfolders use `models/` (plural) except `notifications/model/` (singular); `cdn-file.service.js`/`cdn-file.model.js` use kebab-case, inconsistent with sibling files elsewhere.
- v1 "model" classes are PascalCase static-method classes (`Artwork`, `Role`, `User`) acting as lightweight Kysely repositories; controllers are PascalCase `*Controller` classes with `static async` handlers.
- v2 follows standard Nest conventions (kebab-case files, PascalCase classes, camelCase methods) consistently — the naming itself is cleaner in v2 even though the logic is less complete/often broken.

---

## 6. Integration collision report

**Concepts you plan to add, mapped against what already exists:**

| Planned concept | Already exists as | Notes |
|---|---|---|
| `submissions` | `contest_entries` (v1) / `ContestEntry` (v2) | This is contest-scoped only — it has no concept of a non-contest, general artwork-review submission. Every "submission" today is implicitly tied to a `contest_id`. If your screening pipeline needs to run on *all* artwork uploads (not just contest entries), you'd be screening `artworks` rows directly, which is a materially different join/ownership shape than `contest_entries`. |
| `screening_runs` | NOT PRESENT | No table or concept resembling a screening/analysis run exists in either backend. Net-new. |
| `rulesets` | NOT PRESENT | No rule-engine table exists. The closest analog is the free-text `roles.permissions` JSONB (permission rules, not content rules) — unrelated domain, don't conflate. |
| `review_items` | `moderation_queue` (v1 only — polymorphic `entity_type`/`entity_id`, `status`, `assigned_to`/`reviewed_by`, `decision`, `notes`) | This table already does almost exactly what a `review_items` queue needs, and it's polymorphic so it could point at `artworks` or `contest_entries` rows. It exists in the v1 DDL dump but **is not wired to any route in v1 code** (`moderation` module is not mounted in `index.js`) and **has no equivalent entity in v2 at all**. Extending vs. replacing this table is the central design decision (see below). |
| `audit_log` | `audited_events` (v1 only) | Already exists with the right shape (`actor_id`, `action`, `entity_type`/`entity_id`, `old_values`/`new_values` jsonb, `created_at`). No equivalent in v2. |
| `style_guides` | NOT PRESENT | Frontend has `frontend/app/(explore)/... /settings/brand-guidelines.tsx` and a `compliance/guidelines/` page, but these are UI pages with no backing table/entity in either backend — pure front-end stubs today. |
| `daily_stats` | NOT PRESENT as a table; partially exists as ad hoc queries | `dashboard/src/concepts/dashboard/DashboardPage.jsx` calls `useGetPlatformStatsQuery()` against `adminApi`, which (per the admin module being 0% built in v2 and having no dedicated stats table in v1 either) is presumably computed on the fly in v1's `admin.controller.js`, not stored. No pre-aggregated stats/analytics table exists in either schema. |
| A background worker process | NOT PRESENT | No Redis, no BullMQ/Bull/Agenda/cron in either backend. The v1 process is a single long-running Express process (`node index.js`) with an in-memory `Map` cache; nothing schedules or queues background work today. |
| New routes for review/analytics | Partially exists as UI-only stubs | `frontend/app/compliance/*` (dashboard, ai-screening settings, automated-review settings, inspector, history) and a real, backend-wired `frontend/components/submissions/pending-entries-review.tsx` approve/reject flow already exist client-side. `dashboard/src/router/routes/sidebarRoutes.jsx` has a commented-out `/review-automation` route slot already reserved (Robot icon, `element: null`) — a placeholder clearly intended for something like this. |

### Existing tables that would need new columns rather than new tables

- **`artworks`** and **`contest_entries`** already have `moderation_status`, `moderated_by`, `moderated_at` — a rule-based decision engine's output (pass/fail/flagged, confidence score, which rule fired) would most naturally extend these rather than duplicating status tracking in a new table, if you want moderation state visible on the artwork/entry itself rather than only in a separate queue.
- **`moderation_queue`** (v1) already has `status`, `priority`, `assigned_to`, `reviewed_by`, `decision`, `notes` — adding a `screening_run_id` FK and a `rule_matches jsonb` column here would likely cover "review_items" without a new table, *if* you decide to build on top of this existing-but-unwired table.

### Hard conflicts

- **`moderation_queue`, `audited_events`** — table names you'd very plausibly want to use already exist (in v1's DDL, though disconnected from running code) with compatible-but-not-identical shapes. Reusing these names for new tables would collide; reusing the *tables themselves* is viable but means adapting to their existing polymorphic-`entity_type` design rather than a fixed FK to `submissions`.
- **`/api/moderation`** route prefix: v1 has a `moderation` module (`src/modules/moderation/`) that exists on disk with routes/controller/models but is **not mounted** in `index.js` — so `/api/moderation` is simultaneously "reserved" (code exists under that name) and "free" (not actually live). `frontend/services/api/moderationApi.ts` already calls `${API_BASE_URL}/moderation` endpoints (`/submit`, `/queue`, `/metrics`) that don't currently resolve to anything live on the backend — the frontend is already coded against an API contract for moderation that the backend has never wired up. This is your biggest "collision that isn't actually a collision yet" — you can either finish wiring the existing `moderation` module to match what the frontend already expects, or replace it; either way you must reconcile with the existing frontend contract in `moderationApi.ts`.
- No enum name conflicts found (v1 has no code-level status enums at all — everything is a CHECK constraint or free string).

### Does a second long-running process (a worker) fit the current deploy setup?

**Not natively.** The only deploy path that exists is the GitHub Actions workflow for `backend/`, which builds one Docker image and runs one `docker run` on one VPS, on a single Docker network (`mod-network`), with no compose/orchestration layer. There's no existing pattern for running a second process/container alongside it — no docker-compose file to add a `worker` service to, no queue (Redis/BullMQ) already present to consume from, and no Coolify/k8s abstraction that would make a second process a small config change. Introducing a worker means either: (a) adding Redis + a queue library + a second Docker image + a second block in the deploy workflow (or introducing docker-compose for the first time), or (b) running the screening pipeline in-process within the existing Express app (simplest, but blocks the event loop / couples deploy lifecycle, and the existing app doesn't do any background scheduling today to build on).

### Biggest decisions to make, stated as concrete either/ors

1. **Target backend: v1 or v2?** v1 is live, deployed, and is what the frontend/dashboard actually call — but has no tests, no consistent validation, several unauthenticated admin/RBAC routes, and no migrations to build on top of safely. v2 is architecturally cleaner (real DTOs, guards, DI) but currently does not compile, has zero real tests, and is deployed nowhere. Building the screening pipeline against v1 ships something real quickly on a fragile foundation; building against v2 means fixing pre-existing compile errors and JWT wiring bugs first, before writing a line of screening-pipeline code.
2. **`moderation_queue` (extend the existing-but-unwired v1 table) vs. new `review_items` table.** The existing table's polymorphic `entity_type`/`entity_id` design already fits "review an artwork or a contest entry," but it was designed before you had `screening_runs`/`rulesets` in mind — extending it means retrofitting new FKs onto a polymorphic table; a new table means duplicating status-tracking machinery that already half-exists.
3. **Screen `artworks` directly vs. screen `contest_entries` only.** Today "submission" only formally exists as a contest-scoped concept (`contest_entries`). If the AI screening pipeline should run on every artwork upload (not just contest entries), you need a submission concept that doesn't require a contest — a new, more general `submissions` table (decoupled from contests) vs. reusing `artworks` rows directly as the screening subject.
4. **In-process pipeline vs. real background worker.** No queue infrastructure (Redis/BullMQ) exists in either backend today, and the only deploy pipeline runs a single container with no compose/orchestration to extend. Standing up a proper async worker is a real infrastructure lift (new deploy path, new dependency, new failure mode to operate); running screening synchronously inside request handlers is simpler to ship but will block the Express event loop on any slow AI-model call and has no retry/backoff story.
5. **Reconcile or ignore the frontend's existing moderation contract.** `frontend/services/api/moderationApi.ts` and the whole `frontend/app/compliance/*` section already assume specific endpoints (`/moderation/submit`, `/moderation/queue`, `/moderation/metrics`) and specific settings shapes (`confidenceThreshold`, `autoRejectAI`, `sensitivityLevel`, `checkCharacterAccuracy`, etc.) that presently save nothing and call nothing real. You can either design the new backend API to match what this existing frontend code already expects (least frontend rework) or design the ideal API for the new pipeline and rewrite the frontend compliance section to match (cleaner, more work). The `dashboard/`'s commented-out `/review-automation` route suggests admin-side review UI was anticipated to live in the dashboard app, not (or not only) in `frontend/compliance/*` — you'll also need to decide which of the two frontends (`frontend/` vs `dashboard/`) owns the human review queue UI, since scaffolding for it exists in both, inconsistently.
