// GET /payout/mine must tell a seller which order each payout came from
// (TSK-028 groups the history by order). Reads the model directly and the
// database back; rows are temporary and removed afterwards.
//
// Needs the marketplace migration (payouts, order_items.seller_id):
//   DATABASE_URL="...?options=-csearch_path%3Dmkt_test" node --test tests/payouts

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const { db, requireDatabase } = require('../helpers/db');
const payoutModel = require('../../src/modules/payout/models/payout.model');

const lateUuid = () => 'ffffffff' + crypto.randomUUID().slice(8);

describe('seller payout history', () => {
  const tag = `hist${Date.now()}`;
  let skipReason = '';
  let sellerId;
  let buyerId;
  let artworkId;
  let orderId;
  const payoutIds = [];

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }

    const roles = await db.selectFrom('roles').select(['id', 'name']).execute();
    const roleId = (roles.find((r) => r.name === 'ARTIST') ?? roles[0])?.id;
    const insertUser = async (suffix) =>
      (
        await db
          .insertInto('users')
          .values({ id: lateUuid(), username: `${tag}_${suffix}`, email: `${tag}_${suffix}@example.com`, role_id: roleId, status: 'active' })
          .returning('id')
          .executeTakeFirstOrThrow()
      ).id;

    sellerId = await insertUser('seller');
    buyerId = await insertUser('buyer');

    artworkId = (
      await db
        .insertInto('artworks')
        .values({ id: lateUuid(), creator_id: sellerId, title: `${tag} art`, file_url: 'https://example.com/a.png' })
        .returning('id')
        .executeTakeFirstOrThrow()
    ).id;

    orderId = (
      await db
        .insertInto('orders')
        .values({ id: lateUuid(), order_number: `${tag}-ORD`, buyer_id: buyerId, seller_id: sellerId, status: 'fulfilled', total_cents: 15000 })
        .returning('id')
        .executeTakeFirstOrThrow()
    ).id;

    for (const gross of [10000, 5000]) {
      const item = await db
        .insertInto('order_items')
        .values({ id: lateUuid(), order_id: orderId, artwork_id: artworkId, license_type: 'personal', unit_price_cents: gross, seller_id: sellerId })
        .returning('id')
        .executeTakeFirstOrThrow();
      const payout = await payoutModel.createPayout({
        id: lateUuid(), seller_id: sellerId, order_item_id: item.id,
        gross_cents: gross, platform_fee_cents: gross / 10, net_cents: gross - gross / 10, status: 'pending',
      });
      payoutIds.push(payout.id);
    }
  });

  after(async () => {
    if (skipReason) return;
    if (payoutIds.length) await db.deleteFrom('payouts').where('id', 'in', payoutIds).execute();
    if (orderId) {
      await db.deleteFrom('order_items').where('order_id', '=', orderId).execute();
      await db.deleteFrom('orders').where('id', '=', orderId).execute();
    }
    if (artworkId) await db.deleteFrom('artworks').where('id', '=', artworkId).execute();
    const users = [sellerId, buyerId].filter(Boolean);
    if (users.length) await db.deleteFrom('users').where('id', 'in', users).execute();
  });

  beforeEach(function (t) {
    if (skipReason) t.skip(skipReason);
  });

  it('carries order_id and order_number on every row so the dashboard can group them', async () => {
    const rows = await payoutModel.findBySeller(sellerId);
    const mine = rows.filter((r) => payoutIds.includes(r.id));

    assert.equal(mine.length, 2);
    for (const row of mine) {
      assert.equal(row.order_id, orderId);
      assert.equal(row.order_number, `${tag}-ORD`);
      assert.equal(row.seller_id, sellerId, 'payout columns still present after the join');
    }
  });

  it("only returns the requesting seller's payouts", async () => {
    const rows = await payoutModel.findBySeller(buyerId);
    assert.equal(rows.filter((r) => payoutIds.includes(r.id)).length, 0);
  });
});
