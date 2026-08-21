const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { sql } = require('kysely');

const { db, requireDatabase } = require('../helpers/db');
const migration = require('../../src/migrations/20260820100000_add_contact_fields_to_brand_verification_requests');
const BrandVerificationRequest = require('../../src/modules/brands/models/brandVerificationRequest.model');
const BrandController = require('../../src/modules/brands/controller/brand.controller');

const TABLE = 'brand_verification_requests';
const TICKET_ERROR = /column "contact_email" of relation "brand_verification_requests" does not exist/;

/** Minimal Express res double capturing the status/body the controller sends. */
function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      if (this.statusCode === null) this.statusCode = 200;
      return this;
    },
  };
}

/** Exactly the payload the signup page's brand step submits. */
function signupFormPayload(tag, overrides = {}) {
  return {
    company_name: `${tag} Studios`,
    website: 'https://example.com',
    contact_email: `${tag}@example.com`,
    contact_phone: '+1 555 0100',
    description: 'fixture',
    team_size: '1-10',
    how_heard: 'search',
    ...overrides,
  };
}

/** Column metadata for the table as the given executor (db or transaction) sees it. */
async function columnsOf(executor) {
  const result = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = ${TABLE}
  `.execute(executor);
  return new Map(result.rows.map((row) => [row.column_name, row]));
}

/**
 * Rebuild production's shape: the table exists, but none of the columns the
 * model writes for contact details do. Inside a transaction that is rolled
 * back, so the connected database is left exactly as it was.
 */
async function dropContactColumns(trx) {
  for (const column of migration.COLUMNS) {
    await sql`ALTER TABLE ${sql.table(TABLE)} DROP COLUMN IF EXISTS ${sql.ref(column)}`.execute(trx);
  }
}

/**
 * users has different NOT NULL columns in the local public schema (status)
 * and in prodmirror (role_id), and brand_verification_requests.user_id is
 * NOT NULL only locally. Create a throwaway user and always set it, so the
 * regression test proves the same thing on either schema.
 */
async function createFixtureUser(trx, tag) {
  const role = await trx.selectFrom('roles').select('id').limit(1).executeTakeFirst();
  const user = await trx
    .insertInto('users')
    .values({ username: `${tag}_user`, email: `${tag}_user@example.com`, role_id: role?.id, status: 'active' })
    .returning('id')
    .executeTakeFirstOrThrow();
  return user.id;
}

/** The row BrandVerificationRequest.create builds from the signup payload. */
function modelShapedRow(tag, userId) {
  return {
    user_id: userId,
    ...signupFormPayload(tag),
    documents: [],
    status: 'pending',
  };
}

/**
 * A failed statement aborts the whole Postgres transaction, so the expected
 * failure has to be fenced by a savepoint for the transaction to stay usable.
 */
async function assertInsertFailsLikeTheTicket(trx, row) {
  await sql`SAVEPOINT before_failing_insert`.execute(trx);
  await assert.rejects(trx.insertInto(TABLE).values(row).execute(), TICKET_ERROR);
  await sql`ROLLBACK TO SAVEPOINT before_failing_insert`.execute(trx);
}

class RollbackAfterAssertions extends Error {}

/**
 * The signup form posts company and contact details, and the model inserts
 * them, but production's brand_verification_requests table never got the
 * columns: it predates the migrations directory. Every brand signup failed at
 * the last step with the error in TICKET_ERROR.
 */
describe('add_contact_fields_to_brand_verification_requests migration', () => {
  const tag = `bvr${Date.now()}`;

  before(async () => {
    await requireDatabase();
  });

  it('turns the failing signup insert into a successful one, idempotently', async () => {
    const run = db.transaction().execute(async (trx) => {
      const userId = await createFixtureUser(trx, tag);
      const row = modelShapedRow(tag, userId);

      await dropContactColumns(trx);
      const before = await columnsOf(trx);
      for (const column of migration.COLUMNS) {
        assert.equal(before.has(column), false, `${column} should be absent before the migration`);
      }
      await assertInsertFailsLikeTheTicket(trx, row);

      await migration.up(trx);
      const after = await columnsOf(trx);
      for (const column of migration.COLUMNS) {
        assert.equal(after.get(column)?.data_type, 'text', `${column} should be text`);
        assert.equal(after.get(column)?.is_nullable, 'YES', `${column} should be nullable`);
      }

      await assert.doesNotReject(migration.up(trx), 'a second run must be a no-op, not a failure');

      const inserted = await trx.insertInto(TABLE).values(row).returningAll().executeTakeFirstOrThrow();
      assert.equal(inserted.contact_email, row.contact_email);
      assert.equal(inserted.contact_phone, row.contact_phone);
      assert.equal(inserted.description, row.description);
      assert.equal(inserted.team_size, row.team_size);
      assert.equal(inserted.how_heard, row.how_heard);

      throw new RollbackAfterAssertions();
    });

    await assert.rejects(run, RollbackAfterAssertions);
  });
});

/**
 * The brand step of signup is the only caller. It posts without a session
 * (the route has no auth middleware), so the controller is exercised exactly
 * as the form reaches it.
 */
describe('submitBrandVerificationRequest - brand signup step', () => {
  const tag = `bvr${Date.now()}`;
  const createdIds = [];
  // The local public schema lacks these columns and has user_id NOT NULL;
  // production has the columns (once migrated) and a nullable user_id. On a
  // schema that does not match production, the controller would fail for
  // reasons unrelated to the fix, so detect that and say so.
  let schemaMatchesProduction = false;

  before(async () => {
    await requireDatabase();
    const columns = await columnsOf(db);
    const hasContactColumns = migration.COLUMNS.every((column) => columns.has(column));
    const userIdIsNullable = columns.get('user_id')?.is_nullable === 'YES';
    schemaMatchesProduction = hasContactColumns && userIdIsNullable;
  });

  after(async () => {
    if (createdIds.length) await db.deleteFrom(TABLE).where('id', 'in', createdIds).execute();
  });

  it('stores the signup form payload and returns 201', async (t) => {
    if (!schemaMatchesProduction) {
      return t.skip('connected schema does not match migrated production; apply the migration to prodmirror and run against it');
    }
    const payload = signupFormPayload(tag);
    const res = makeRes();

    await BrandController.submitBrandVerificationRequest({ body: payload }, res);

    assert.equal(res.statusCode, 201, `expected 201, got ${res.statusCode} ${JSON.stringify(res.body)}`);
    assert.equal(res.body.success, true);
    createdIds.push(res.body.requestId);

    const stored = await BrandVerificationRequest.findById(res.body.requestId);
    assert.equal(stored.company_name, payload.company_name);
    assert.equal(stored.website, payload.website);
    assert.equal(stored.contact_email, payload.contact_email);
    assert.equal(stored.contact_phone, payload.contact_phone);
    assert.equal(stored.description, payload.description);
    assert.equal(stored.team_size, payload.team_size);
    assert.equal(stored.how_heard, payload.how_heard);
    assert.equal(stored.status, 'pending');
    assert.equal(stored.user_id, null);
  });

  it('rejects a payload without a contact email before touching the database', async () => {
    const res = makeRes();

    await BrandController.submitBrandVerificationRequest(
      { body: signupFormPayload(tag, { contact_email: '   ' }) },
      res
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Contact email is required');
  });

  it('rejects a payload without a company name before touching the database', async () => {
    const res = makeRes();

    await BrandController.submitBrandVerificationRequest(
      { body: signupFormPayload(tag, { company_name: '' }) },
      res
    );

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Company name is required');
  });
});
