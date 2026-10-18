# Testing the AI screening flow locally

Everything runs on your machine: Postgres, Redis and an S3 stand-in (MinIO) in Docker, the
Firebase Auth emulator instead of real accounts, and fake AI providers that you steer with the
artwork's title. Nothing touches the shared database, the real Firebase project, S3 or a billed
provider.

## One-time setup

- Docker, Node 22+, and the Firebase CLI: `npm install -g firebase-tools`
- `npm install` in `backend/`, `frontend/` and `dashboard/`

## Start everything

Each long-running command needs its own terminal.

| # | Where | Command | Leave running? |
|---|---|---|---|
| 1 | `backend/` | `npm run e2e:services` | no (starts the Docker containers) |
| 2 | `backend/` | `npm run e2e:auth` | **yes** (auth emulator, port 9099) |
| 3 | `backend/` | `npm run e2e:migrate && npm run e2e:seed -- --reset` | no |
| 4 | `backend/` | `npm run e2e:api` | **yes** (API, port 5000) |
| 5 | `backend/` | `npm run e2e:worker` | **yes** (screening worker) |
| 6 | `frontend/` | `npm run dev:e2e` | **yes** (http://localhost:3000) |
| 7 | `dashboard/` | `npm run dev:e2e` | **yes** (http://localhost:5173) |

The seed prints the accounts and links. Every password is `password123`:

| Account | Role | Where to sign in |
|---|---|---|
| `artist@local.test` | artist | http://localhost:3000/login |
| `brand@local.test` | owns the brand "Acme Comics" and its live contest | http://localhost:3000/login |
| `admin@local.test` | platform admin | http://localhost:5173/login |

The emulator keeps accounts in memory. **Whenever you restart step 2, re-run
`npm run e2e:seed`** (the database users are kept and re-linked).

`npm run e2e:seed -- --reset` also deletes the artist's previous submissions and the brand's
screening rules and style guides, so every walkthrough starts clean.

## How the fake providers decide

With `SCREENING_ADAPTERS=mock` (set in `backend/e2e.env`) the verdict depends on whole words in
the **artwork title**:

| Title contains | What screening sees | Typical result |
|---|---|---|
| nothing special | human-made, safe, on-guide | approved (or review, if the rules require it) |
| `flag` | content safety score 85% | in review |
| `reject` | content safety score 97% | rejected outright |
| `ai` or `midjourney` | AI-generated (4% human) | in review, or rejected if "reject AI outright" is on |
| `borderline` | 70% human-made | in review when 70% falls in the grey zone |
| `offstyle` | low style and brand-fit scores | in review |
| `infringing` | 95% IP risk | in review |
| `mockfail` | every provider errors | stays "Screening" for ~80s (retries), then in review |
| a word the brand's style guide bans (`No pink` → "pink") | style guide violation | in review |

PDF uploads are never sent to the providers. They always go to human review.

The upload form fills each title from its file name, and you can edit it per file. So any
images will do: rename them, or change the title box.

## Walkthrough (about 15 minutes)

### 1. Brand sets its rules (http://localhost:3000, `brand@local.test`)

1. Sidebar → **AI Screening**. The header says *Using the platform default (version N)*.
2. Move **Minimum human-made confidence** to 70%. Make sure **Always require human review** is
   off and **Notify artists** is on. The footer counts your unpublished changes.
3. Click **Publish version 1**. A toast confirms, and the header now says *Version 1, published …*.
4. Under **Style guide**, upload a PDF, or paste `No pink` / `The hero must wear the red jacket`.
   Then click **Upload and compile**. *In force since …* appears with the compiled rules.

### 2. Artist submits (`artist@local.test`)

1. Open the contest upload link printed by the seed
   (`/artist/local_artist/my-artworks/new?contest=…`).
2. Add several files with titles like `Hero sunrise`, `Hero flag pose`, `Hero reject pose`,
   `Borderline hero`, `Pink hero portrait`, `Infringing hero logo`, `Hero mockfail`, plus one PDF.
3. Fill in the description, category and Fandom / Original IP, then click **Submit N Entries**.
   A toast says the entries are checked automatically, then you land on **My Artworks**.
4. Each card shows **Review:** *Approved* (Hero sunrise), *Rejected* (Hero reject pose),
   *In review* (the rest) or *Screening* (Hero mockfail, for now). **Publish** appears only on
   approved work. The **Pending** and **Rejected** tabs filter by the review status.
5. The bell in the header has an unread count. Open it to see *approved*, *not accepted* and
   *being reviewed* notices. Clicking one opens that artwork.

### 3. Brand reviews (`brand@local.test`)

1. Sidebar → **Review Queue**. Every flagged entry shows the image, the artist, the contest,
   why it was flagged in plain English, and what each check found. Approved and rejected
   work is not listed.
2. Add a note and **Approve** *Hero flag pose*, **Reject** *Infringing hero logo*, and
   **Escalate** *Pink hero portrait*. Each one leaves *Needs review*.
3. **Escalated** shows the escalation as read-only (*Waiting on a platform moderator*).
   **Reviewed** shows the decisions with their notes.
4. Click **View submission** on *Borderline hero*. The entry page shows *Entry pending* /
   *AI screening In review* and the screening panel. Click **Rescreen**: a toast confirms, and
   the panel refreshes within a few seconds. The queue still has a single item for it.

### 4. Admin (http://localhost:5173, `admin@local.test`)

1. Sidebar → **AI Moderation**. You'll see queue and screening metrics, then *Pending* (every
   brand, plus any user reports), *Escalated* and *Reviewed*.
2. On **Escalated**, open **Screening history**, then **Approve** *Pink hero portrait* with a note.
3. **Screening rules** edits the platform default that brands without their own rules use.
   Change something and click **Publish new version**; the version number goes up by one.

### 5. Artist again

1. **My Artworks**: *Hero flag pose* and *Pink hero portrait* now read *Approved*, and
   *Infringing hero logo* reads *Rejected*. **Publish** on *Hero flag pose* works, and the card
   shows *Published*.
2. The bell has new notices for each human decision.
3. About 80 seconds after submitting, *Hero mockfail* reads *In review*. In the brand's queue
   it says *A check could not run*: when providers fail, the submission goes to a human and is
   never approved automatically.

## Checking what happened underneath

```bash
docker exec -it modfanart-postgres psql -U modfanart modfanart_dev
```

```sql
-- every screening run, newest first
SELECT a.title, r.status, r.decision, r.decision_reasons->0->>'code' AS first_reason
FROM screening_runs r JOIN artworks a ON a.id = r.artwork_id ORDER BY r.created_at DESC;

-- the audit trail: machine decisions (no actor) and human overrides (with actor and notes)
SELECT action, actor_id IS NOT NULL AS human, old_values->>'moderation_status' AS old,
       new_values->>'moderation_status' AS new, new_values->>'notes' AS notes
FROM audited_events ORDER BY created_at DESC LIMIT 20;

-- the review queue
SELECT entity_type, status, decision, notes FROM moderation_queue ORDER BY created_at DESC;
```

The worker terminal logs each retry (`job … failed on attempt n/5`) for `mockfail` titles.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Sign-in fails, or the API says *User not found. Call /api/auth/sync first* | The emulator was restarted. Run `npm run e2e:seed`. |
| Everything stays *Screening* | The worker (step 5) isn't running. |
| Images don't load | The MinIO container stopped. Run `npm run e2e:services`. |
| `429 Too Many Requests` | The global API limit (`API_RATE_LIMIT`, default 1000 per 15 min per IP) was hit. Restart the API. |
| A port is already in use | Something else is on 5434, 6381, 9000, 9099, 5000, 3000 or 5173. Stop it, or change the port in `backend/e2e.env` and `src/scripts/e2e-services.sh`. |

## Against the real providers

Remove `SCREENING_ADAPTERS=mock` from `backend/e2e.env` and set `AIORNOT_API_KEY` and
`OPENAI_API_KEY` there. The worker refuses to start without them. AIORNOT is billed per image,
and style-guide compilation and the style check use OpenAI chat completions.
