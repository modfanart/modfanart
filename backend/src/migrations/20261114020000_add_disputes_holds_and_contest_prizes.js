// src/migrations/20261114020000_add_disputes_holds_and_contest_prizes.js
//
// GA-18: chargebacks. Payouts can now be put 'on_hold' while a dispute is
//        open (released back to 'pending' if we win, 'failed' if we lose).
// GA-25: contest prizes were written into `orders` as 'fulfilled' with
//        buyer_id = a brand id (orders.buyer_id references users), and
//        nothing tracked whether the brand ever paid. Prizes now live in their
//        own table with an explicit funding lifecycle.
// GA-21: payouts must survive a hard delete of the seller (financial record).

const { sql } = require('kysely');

async function up(db) {
  // ── payouts: on_hold + keep records if the user is deleted ───────
  await sql`ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_status_check`.execute(db);
  await sql`
    ALTER TABLE payouts ADD CONSTRAINT payouts_status_check
      CHECK (status IN ('pending', 'on_hold', 'paid', 'failed'))
  `.execute(db);

  await sql`
    DO $$
    DECLARE fk text;
    BEGIN
      SELECT conname INTO fk FROM pg_constraint
       WHERE conrelid = 'payouts'::regclass AND contype = 'f'
         AND pg_get_constraintdef(oid) LIKE '%(seller_id)%REFERENCES users%';
      IF fk IS NOT NULL THEN
        EXECUTE format('ALTER TABLE payouts DROP CONSTRAINT %I', fk);
        ALTER TABLE payouts ADD CONSTRAINT payouts_seller_id_fkey
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT;
      END IF;
    END $$
  `.execute(db);

  // ── disputes (one row per Stripe dispute) ────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS payment_disputes (
      id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      stripe_dispute_id  text NOT NULL UNIQUE,
      stripe_charge_id   text NOT NULL,
      amount_cents       integer NOT NULL,
      reason             text,
      status             text NOT NULL,          -- Stripe dispute status
      outcome            text,                   -- 'won' | 'lost' | null
      created_at         timestamptz NOT NULL DEFAULT now(),
      updated_at         timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS payment_disputes_charge_idx ON payment_disputes (stripe_charge_id)`.execute(db);

  // ── contest prizes ───────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS contest_prizes (
      id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      contest_id     uuid NOT NULL REFERENCES contests(id) ON DELETE RESTRICT,
      entry_id       uuid NOT NULL UNIQUE REFERENCES contest_entries(id) ON DELETE RESTRICT,
      winner_id      uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      brand_id       uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
      rank           integer NOT NULL,
      prize_type     text NOT NULL DEFAULT 'cash',
      description    text,
      amount_cents   integer NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
      currency       text NOT NULL DEFAULT 'USD',
      status         text NOT NULL DEFAULT 'awaiting_funding'
                       CHECK (status IN ('awaiting_funding', 'funded', 'paid', 'cancelled')),
      funded_at      timestamptz,
      paid_at        timestamptz,
      payment_reference text,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS contest_prizes_contest_idx ON contest_prizes (contest_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS contest_prizes_winner_idx ON contest_prizes (winner_id)`.execute(db);

  // Move any prize rows previously stored as orders. Guarded in plpgsql:
  // a failing statement would abort the migration transaction, so a JS
  // .catch() is not enough on environments without these columns.
  await sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'orders' AND column_name = 'source_type')
         AND EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'orders' AND column_name = 'source_id') THEN
        INSERT INTO contest_prizes (contest_id, entry_id, winner_id, brand_id, rank,
                                    amount_cents, currency, status, created_at)
        SELECT ce.contest_id, ce.id, ce.creator_id, c.brand_id, coalesce(ce.rank, 0),
               coalesce(o.total_cents, 0), coalesce(o.currency, 'USD'),
               'awaiting_funding', o.created_at
          FROM orders o
          JOIN contest_entries ce ON ce.id::text = o.source_id::text
          JOIN contests c ON c.id = ce.contest_id
         WHERE o.source_type = 'contest_prize'
        ON CONFLICT (entry_id) DO NOTHING;
      END IF;
    END $$
  `.execute(db);
}

async function down(db) {
  await sql`DROP TABLE IF EXISTS contest_prizes`.execute(db);
  await sql`DROP TABLE IF EXISTS payment_disputes`.execute(db);
  await sql`ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_status_check`.execute(db);
  await sql`
    ALTER TABLE payouts ADD CONSTRAINT payouts_status_check
      CHECK (status IN ('pending', 'paid', 'failed'))
  `.execute(db);
}

module.exports = { up, down };
