# Demoing the AI screening pipeline

Import both files into Postman and work down the folders. Every request stores what the next one
needs, so there is nothing to copy by hand.

| File | What it is |
|---|---|
| `modfanart-screening.postman_collection.json` | 18 requests covering every screening and moderation endpoint |
| `modfanart-screening.postman_environment.json` | The variables, pre-declared and empty — select it as your active environment |

The environment file exists so secrets stay out of the collection: `firebase_api_key`,
`demo_password` and `id_token` are marked `secret`, so Postman masks them and leaves them behind
when you export or share the collection.

## The 30-second version, with no auth at all

If you just need to show the pipeline working and don't want to fight Firebase for a token:

```bash
cd backend
npm run demo:services   # Postgres + Redis
npm run worker          # leave running in its own terminal
npm run demo:seed       # 4 artworks chosen to hit 4 different outcomes
npm run demo:run        # screens them and prints the verdicts
```

```
ARTWORK                         DECISION        ARTWORK STATUS  WHY
--------------------------------------------------------------------------------------------------
A hand drawn cat                auto_approved   approved        authenticity_pass | auto_approved
reject this artwork             auto_rejected   rejected        moderation_auto_reject
an ai generated landscape       flagged_manual  flagged         authenticity_fail
totally original artwork        flagged_manual  flagged         duplicate_of_rejected
```

`demo:run` enqueues on the same BullMQ queue the upload controller uses and then reads the database,
so what it prints is the worker's own output — the only thing it skips is the HTTP hop. Use it when
the story is "the pipeline decides correctly"; use Postman below when the story is "the API works".

`demo:seed` publishes a platform ruleset version with `requireHumanReview: false`. The default is
`true`, which is correct for a fresh install but routes even clean artwork to the review queue, so
without this every row above would read `flagged_manual`.

## Getting a token

`npm run demo:token` mints one through the Admin SDK, so no account password is needed. It currently
fails with `INVALID_CUSTOM_TOKEN` on this machine even though the project IDs match and the clock is
exact, which points at the committed service-account key being rotated or disabled — worth checking,
because if that key is dead then `authenticateToken` cannot verify *any* token locally and no
authenticated route will work regardless of how the token was obtained.

The reliable fallback is a real browser token: sign in to the deployed frontend, and from the
devtools console run `await firebase.auth().currentUser.getIdToken()` (or read it out of the network
tab's `Authorization` header). Same Firebase project, so your local backend accepts it. Tokens last
an hour.

## Before you start: check your local `.env`

`backend/.env` now has all five variables the demo needs, and the Firebase credentials path points
at a file that exists. One thing is still wrong on this machine:

```
$ npm run migrate:status
❌ Failed to connect to database! password authentication failed for user "modfanart"
```

`DATABASE_URL` is present and aimed at `localhost:5432/modfanart_dev`, but the password is not
accepted — so migrations, the API and the worker all fail against the database until it is fixed.
Correct the credentials, or point the URL at a database you can actually reach, before working
through the requests below.

The variables the demo relies on:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/home/aakash/Documents/modfanart/backend/modfanart-firebase-adminsdk-fbsvc-6a7ddc187d.json
DATABASE_URL=postgres://<user>:<pass>@<host>:5432/<db>
DB_SSL=false
REDIS_URL=redis://localhost:6379
SCREENING_ADAPTERS=mock
```

`SCREENING_ADAPTERS=mock` is the important one for a standup: the pipeline runs end to end with fake
adapters, so you need no AIORNOT or OpenAI key and spend nothing. The mock adapters read the artwork
title — a title containing `ai generated` comes back as AI, `explicit` or `violence` trips
moderation, anything else screens clean. Drop the variable and add real keys to demo live providers.

## Start the stack (4 terminals, ~2 minutes)

```bash
cd backend

# 1. Redis for the queue
npm run demo:services

# 2. Schema (safe to re-run; every migration is idempotent)
npm run migrate:latest

# 3. API
npm run dev            # http://localhost:5000

# 4. Worker — this is the process that actually screens
npm run worker
```

Keep the worker terminal visible during the demo. It logs each run as it picks it up, which makes
the async hand-off obvious without anyone having to trust the database.

## Wire up Postman (~2 minutes)

Select **MOD Screening — local** as the active environment, then fill in these three:

| Variable | Where it comes from |
|---|---|
| `base_url` | `http://localhost:5000` |
| `firebase_api_key` | `NEXT_PUBLIC_FIREBASE_API_KEY` in `frontend/.env.local` |
| `demo_email` / `demo_password` | any existing Firebase account you can sign in as |

Then:

1. Run **01 Sign in** — mints a real Firebase ID token and stores it. Auth is not stubbed for the
   demo; the backend verifies this token with the Admin SDK exactly as in production.
2. Run **02 Sync user** — creates the matching `users` row. Without it every authenticated route
   answers `403 User not found. Call /api/auth/sync first.`
3. Grant the account the two permissions the new routes require, once:

```bash
npm run demo:grant -- your.demo@email.com
```

4. Re-run **01 Sign in** so the token reflects the new role, and you're ready.

## The 5-minute demo path

| # | Request | What to point at |
|---|---|---|
| 03 | Upload artwork (clean) | Response carries `screening_run_id` — the upload returned immediately and screening is happening in the background |
| 07 | Screening history | `status` flipped `running` → `complete`; raw per-stage provider output; `decision_reasons` shows the ordered rule hits |
| 09 | Effective ruleset | Seeded default has `requireHumanReview: true`, so nothing auto-approves on a fresh install |
| 10 | Publish new ruleset version | Version increments; config is immutable, so old runs stay explainable |
| 08 | Rescreen | Re-run under the new ruleset — now reaches `auto_approved` |
| 04 | Upload prohibited | Rejected path |
| 04 again, same file | Dedupe | Resubmitting rejected bytes short-circuits to human review with **zero** paid API calls |
| 13 | Review queue | Flagged item, enriched with the run that flagged it |
| 14 | Resolve | Human override; send twice to show it refuses a double review |
| 15 | Metrics | Decision split, queue depth, average human resolution time — computed on read |

Folder 04 has the two negative checks worth showing: no token gives 401, and a bad UUID gives a 400
naming the offending field rather than a 500.

### The contest path — where the style stage actually runs

Requests **05** and **06** in folder 01 cover the second way into the pipeline, and it is the one
worth demoing if brand rules are the topic.

A standalone gallery upload has no brand context, so the style + IP stage is skipped as
`no_brand_context` and the verdict rests on authenticity and content safety alone. Submitting the
same artwork to a contest screens it *again*, this time inheriting the contest owner's brand — which
means the ruleset resolves to that brand's latest version rather than the platform default, the
brand's style guide is loaded, and the style stage runs for real.

Run **05** to pick up a live contest id, then **06** to submit `{{artwork_id}}` into it. Compare the
two runs from request 07: same image, different rulesets, and a populated `style`
column on the second. The verdict lands on both `artworks` and `contest_entries`.

Request 06 needs a contest that is `live` with an open submission window, an artwork of yours in
`published` or `draft`, and room under the per-user entry cap — otherwise it answers 403 with the
reason.

If someone asks about the audit trail, every status change writes an `audited_events` row:

```sql
select action, entity_type, entity_id, new_values, created_at
from audited_events order by created_at desc limit 10;
```

## If something doesn't work

| Symptom | Cause |
|---|---|
| API won't boot, `FirebaseAppError ... ENOENT` | `GOOGLE_APPLICATION_CREDENTIALS` still points at the missing file |
| `403 User not found` | Run request 02 |
| `403 Insufficient permissions` + `required: ...` | Run `npm run demo:grant`, then re-run request 01 |
| `screening_run_id` is `null` in the upload response | Redis isn't up. The hook is failure-tolerant by design — an artist's upload never fails because the queue is down |
| Run stays `running` | The worker isn't running, or it crashed at boot for want of AI keys. Set `SCREENING_ADAPTERS=mock` |
| Style stage always `skipped` | Expected without brand context. Upload a style guide (request 09) for a brand that owns the artwork |
