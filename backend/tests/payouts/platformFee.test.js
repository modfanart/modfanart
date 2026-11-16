// The platform fee must come from platform_fee_rules for every money path
// (TSK-025), and the same resolver feeds both the payouts ledger and the
// Stripe application fee on legacy license checkouts (TSK-024), so the two
// never disagree. Reads the seeded rules from the connected database.

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { db, requireDatabase } = require('../helpers/db');
const { resolvePlatformFeeCents } = require('../../src/modules/payout/payout.service');

describe('platform fee resolution', () => {
  let skipReason = '';
  let seeded = {};

  before(async () => {
    const { skip, reason } = await requireDatabase();
    if (skip) {
      skipReason = reason;
      return;
    }
    const rows = await db
      .selectFrom('platform_fee_rules')
      .select(['fulfillment_type', 'base_product_type', 'fee_bps'])
      .where('is_active', '=', true)
      .where('base_product_type', 'is', null)
      .execute();
    for (const r of rows) seeded[r.fulfillment_type ?? 'default'] = r.fee_bps;
  });

  beforeEach(function (t) {
    if (skipReason) t.skip(skipReason);
  });

  it('digital licenses (null/null) use the seeded default rule', async () => {
    assert.ok(seeded.default, 'default rule must be seeded');
    assert.equal(await resolvePlatformFeeCents(null, null, 10000), Math.floor((10000 * seeded.default) / 10000));
  });

  it('print-on-demand merch uses its own wildcard rule', async () => {
    assert.ok(seeded.print_on_demand, 'POD rule must be seeded');
    assert.equal(
      await resolvePlatformFeeCents('print_on_demand', 'poster', 10000),
      Math.floor((10000 * seeded.print_on_demand) / 10000)
    );
  });

  it('rounds the fee down so the platform never takes more than the rule', async () => {
    const fee = await resolvePlatformFeeCents(null, null, 999);
    assert.equal(fee, Math.floor((999 * seeded.default) / 10000));
    assert.ok(fee <= (999 * seeded.default) / 10000);
  });
});
