const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const BrandController = require('../../src/modules/brands/controller/brand.controller');

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

async function roleId(name) {
  const role = await db.selectFrom('roles').select('id').where('name', '=', name).executeTakeFirst();
  return role?.id;
}

async function createUser(tag, roleName) {
  return db
    .insertInto('users')
    .values({
      username: tag,
      email: `${tag}@example.com`,
      role_id: await roleId(roleName),
      status: 'active',
      email_verified: true,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
}

async function createRequest(tag, userId, contactEmail = `${tag}@example.com`) {
  return db
    .insertInto('brand_verification_requests')
    .values({
      user_id: userId,
      company_name: `${tag} Comics`,
      contact_email: contactEmail,
      description: 'fixture',
      documents: [],
      status: 'pending',
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
}

async function approve(requestId, reviewerId) {
  const res = makeRes();
  await BrandController.approveBrandVerificationRequest(
    { params: { requestId }, body: {}, user: { id: reviewerId } },
    res
  );
  return res;
}

/**
 * AUTH-01: a brand account's "Dashboard" link needs a brand attached to that account.
 * Approval used to create a brand-new manager user (and crashed on undefined helpers),
 * so the person who signed up never got their brand.
 */
describe('approveBrandVerificationRequest', () => {
  const tag = `bva${Date.now()}`;
  const userIds = [];
  const requestIds = [];

  before(async () => {
    await requireDatabase();
  });

  after(async () => {
    const brands = await db
      .selectFrom('brands')
      .select('id')
      .where('verification_request_id', 'in', requestIds.length ? requestIds : ['00000000-0000-0000-0000-000000000000'])
      .execute();
    const brandIds = brands.map((b) => b.id);
    if (brandIds.length) {
      await db.deleteFrom('brand_managers').where('brand_id', 'in', brandIds).execute();
      await db.deleteFrom('brands').where('id', 'in', brandIds).execute();
    }
    if (requestIds.length) {
      await db.deleteFrom('brand_verification_requests').where('id', 'in', requestIds).execute();
    }
    if (userIds.length) await db.deleteFrom('users').where('id', 'in', userIds).execute();
  });

  it('attaches the new brand to the account that filed the request', async () => {
    const applicant = await createUser(`${tag}_brand`, 'BRAND_MANAGER');
    const reviewer = await createUser(`${tag}_admin`, 'ADMIN');
    userIds.push(applicant.id, reviewer.id);
    const request = await createRequest(`${tag}_brand`, applicant.id);
    requestIds.push(request.id);

    const res = await approve(request.id, reviewer.id);

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    const brand = await db
      .selectFrom('brands')
      .selectAll()
      .where('id', '=', res.body.brandId)
      .executeTakeFirstOrThrow();
    assert.equal(brand.user_id, applicant.id);
    assert.equal(brand.status, 'active');
    assert.equal(brand.verification_request_id, request.id);

    const manager = await db
      .selectFrom('brand_managers')
      .selectAll()
      .where('brand_id', '=', brand.id)
      .executeTakeFirstOrThrow();
    assert.equal(manager.user_id, applicant.id);
    assert.equal(manager.role, 'owner');

    const updated = await db
      .selectFrom('brand_verification_requests')
      .selectAll()
      .where('id', '=', request.id)
      .executeTakeFirstOrThrow();
    assert.equal(updated.status, 'approved');
    assert.equal(updated.reviewed_by, reviewer.id);
  });

  it('refuses to approve twice', async () => {
    const res = await approve(requestIds[0], userIds[1]);
    assert.equal(res.statusCode, 400);
  });

  it('links an anonymous lead to the account registered with its contact email', async () => {
    const fan = await createUser(`${tag}_fan`, 'DEFAULT_USER');
    userIds.push(fan.id);
    const request = await createRequest(`${tag}_lead`, null, `${tag}_fan@example.com`);
    requestIds.push(request.id);

    const res = await approve(request.id, userIds[1]);

    assert.equal(res.statusCode, 200, JSON.stringify(res.body));
    const user = await db
      .selectFrom('users as u')
      .innerJoin('roles as r', 'r.id', 'u.role_id')
      .select(['r.name'])
      .where('u.id', '=', fan.id)
      .executeTakeFirstOrThrow();
    assert.equal(user.name, 'BRAND_MANAGER', 'the applicant becomes a brand manager');
  });

  it('leaves the request pending when nobody has an account to receive the brand', async () => {
    const request = await createRequest(`${tag}_nobody`, null, `${tag}_nobody@example.com`);
    requestIds.push(request.id);

    const res = await approve(request.id, userIds[1]);

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.code, 'APPLICANT_HAS_NO_ACCOUNT');
    const unchanged = await db
      .selectFrom('brand_verification_requests')
      .select('status')
      .where('id', '=', request.id)
      .executeTakeFirstOrThrow();
    assert.equal(unchanged.status, 'pending');
  });
});
