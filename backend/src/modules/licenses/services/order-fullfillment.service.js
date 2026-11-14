const { randomUUID } = require("crypto");
const { db } = require("../../../config");
const { sql } = require("kysely");
const {
  generateLicensePDF,
  generateInvoicePDF,
} = require("../../../common/utils/pdfGenerators");
const payoutService = require("../../payout/payout.service");

class OrderFulfillmentService {
  // Entry point for a succeeded PaymentIntent. Handles both shapes:
  //  - legacy single-license purchases:  metadata.order_id
  //  - cart checkouts (one payment, N per-seller orders): metadata.order_ids
  // Idempotent per order — already-processed orders are skipped, so the
  // Stripe webhook and the frontend's confirm-payment call can both run.
  static async fulfillOrder(paymentIntent) {
    const raw =
      paymentIntent.metadata?.order_ids || paymentIntent.metadata?.order_id;

    if (!raw) {
      throw new Error("Missing order_id in payment intent metadata");
    }

    const orderIds = raw.split(",").filter(Boolean);
    const results = [];

    for (const orderId of orderIds) {
      results.push(await this.fulfillSingleOrder(orderId, paymentIntent));
    }

    return results.length === 1 ? results[0] : { success: true, results };
  }

  static async fulfillSingleOrder(orderId, paymentIntent) {
    const order = await db
      .selectFrom("orders")
      .selectAll()
      .where("id", "=", orderId)
      .executeTakeFirst();

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== "pending") {
      console.log(`Order ${orderId} already ${order.status} - skipping`);
      return { alreadyProcessed: true, orderId };
    }

    const buyerId = order.buyer_id || paymentIntent.metadata?.buyer_id;

    // The webhook and the client's confirm-payment call can arrive at the
    // same time. The status check above is outside the transaction, so both
    // could pass it and fulfil twice (duplicate licenses, double stock
    // decrement, double payouts). Claim the order atomically first.
    const ALREADY = Symbol("already-processed");
    let outcome;
    try {
    outcome = await db.transaction().execute(async (trx) => {
      const claimed = await trx
        .updateTable("orders")
        .set({ updated_at: new Date().toISOString() })
        .where("id", "=", orderId)
        .where("status", "=", "pending")
        .executeTakeFirst();
      if (!claimed || Number(claimed.numUpdatedRows) === 0) throw ALREADY;

      const items = await trx
        .selectFrom("order_items")
        .selectAll()
        .where("order_id", "=", orderId)
        .execute();

      const buyer = await trx
        .selectFrom("users")
        .select(["id", "username", "email"])
        .where("id", "=", buyerId)
        .executeTakeFirstOrThrow();

      await trx
        .updateTable("orders")
        .set({
          status: "paid",
          stripe_payment_intent_id: paymentIntent.id,
          stripe_charge_id:
            paymentIntent.latest_charge || paymentIntent.charges?.data?.[0]?.id,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where("id", "=", orderId)
        .execute();

      // Digital licenses are issued the moment payment lands. Merch lines
      // stay open until the seller ships them (see fulfillment.service).
      const licenseItems = items.filter(
        (i) => (i.item_type || "license") === "license"
      );
      const hasMerch = items.some((i) => i.item_type === "merch_variant");
      const issued = [];

      for (const item of licenseItems) {
        const artwork = await trx
          .selectFrom("artworks")
          .select(["id", "title", "creator_id"])
          .where("id", "=", item.artwork_id)
          .executeTakeFirstOrThrow();

        const seller = await trx
          .selectFrom("users")
          .select(["id", "username", "email"])
          .where("id", "=", item.seller_id || artwork.creator_id)
          .executeTakeFirstOrThrow();

        const licenseId = randomUUID();

        await trx
          .insertInto("licenses")
          .values({
            id: licenseId,
            order_item_id: item.id,
            artwork_id: item.artwork_id,
            buyer_id: buyerId,
            seller_id: seller.id,
            license_type: item.license_type,
            contract_pdf_url: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .execute();

        let contractUrl = null;

        try {
          contractUrl = await generateLicensePDF(
            {
              id: licenseId,
              license_type: item.license_type,
              created_at: new Date().toISOString(),
            },
            order,
            buyer,
            seller,
            artwork
          );
        } catch (pdfErr) {
          console.error("License PDF generation failed:", pdfErr);
        }

        await trx
          .updateTable("licenses")
          .set({
            contract_pdf_url: contractUrl || "generation_failed",
            updated_at: new Date().toISOString(),
          })
          .where("id", "=", licenseId)
          .execute();

        issued.push(licenseId);
      }

      // GA-19: sequential, unique invoice number from a DB sequence
      // (migration 20261114010000), allocated before the PDF so the number
      // printed on the invoice matches the one stored on the order.
      const { invoice_number: invoiceNumber } = await sql`
        SELECT 'INV-' || nextval('invoice_number_seq') AS invoice_number
      `.execute(trx).then((r) => r.rows[0]);

      let invoiceUrl = null;

      try {
        invoiceUrl = await generateInvoicePDF({
          ...order,
          invoice_number: invoiceNumber,
          paid_at: new Date().toISOString(),
        });
      } catch (pdfErr) {
        console.error("Invoice PDF generation failed:", pdfErr);
      }

      const update = {
        invoice_pdf_url: invoiceUrl || "generation_failed",
        invoice_number: invoiceNumber,
        updated_at: new Date().toISOString(),
      };

      // A license-only order is complete now; one with physical goods
      // becomes "fulfilled" when the last shipment is delivered.
      if (!hasMerch) {
        update.status = "fulfilled";
        update.fulfilled_at = new Date().toISOString();
      }

      await trx.updateTable("orders").set(update).where("id", "=", orderId).execute();

      return { success: true, orderId, licenseIds: issued, hasMerch };
    });
    } catch (e) {
      if (e === ALREADY) {
        console.log(`Order ${orderId} claimed by a concurrent fulfilment - skipping`);
        return { alreadyProcessed: true, orderId };
      }
      throw e;
    }

    // Digital-only orders are done, so their payouts can be generated now.
    // Kept outside the transaction (payouts read committed order_items) and
    // wrapped so a payout hiccup never undoes licenses the buyer already has.
    if (!outcome.hasMerch) {
      try {
        await payoutService.generatePayoutsForOrder(orderId);
      } catch (payoutErr) {
        console.error(`Payout generation failed for order ${orderId}:`, payoutErr);
      }
    }

    return outcome;
  }

  // Marks an unpaid order failed/cancelled and puts reserved merch stock
  // back — checkout decrements stock up-front, so without this a failed or
  // abandoned payment would leave inventory stuck.
  static async markOrderAsFailed(orderId) {
    await db.transaction().execute(async (trx) => {
      const order = await trx
        .selectFrom("orders")
        .select(["id", "status"])
        .where("id", "=", orderId)
        .executeTakeFirst();

      if (!order || order.status !== "pending") return;

      const merchItems = await trx
        .selectFrom("order_items")
        .select(["merch_variant_id", "quantity"])
        .where("order_id", "=", orderId)
        .where("item_type", "=", "merch_variant")
        .execute();

      for (const item of merchItems) {
        await trx
          .updateTable("merch_variants")
          .set((eb) => ({ stock_qty: eb("stock_qty", "+", item.quantity) }))
          .where("id", "=", item.merch_variant_id)
          .where("stock_qty", "is not", null)
          .execute();
      }

      await trx
        .updateTable("orders")
        .set({ status: "failed", updated_at: new Date().toISOString() })
        .where("id", "=", orderId)
        .execute();
    });
  }

  // GA-18: chargebacks.
  //   opened -> orders 'disputed', unpaid payouts 'on_hold' (not payable)
  //   won    -> payouts back to 'pending', order back to paid/fulfilled
  //   lost   -> licenses revoked, held payouts 'failed', order 'refunded';
  //             payouts already paid are logged for clawback.
  static async handleDispute(dispute) {
    const chargeId = dispute?.charge;
    if (!chargeId || !dispute?.id) return { handled: false };

    const closed = ["won", "lost"].includes(dispute.status);
    const outcome = closed ? dispute.status : null;

    await db
      .insertInto("payment_disputes")
      .values({
        stripe_dispute_id: dispute.id,
        stripe_charge_id: chargeId,
        amount_cents: Number(dispute.amount) || 0,
        reason: dispute.reason || null,
        status: dispute.status,
        outcome,
      })
      .onConflict((oc) =>
        oc.column("stripe_dispute_id").doUpdateSet({
          status: dispute.status,
          outcome,
          updated_at: new Date().toISOString(),
        })
      )
      .execute();

    const orders = await db
      .selectFrom("orders")
      .select(["id", "fulfilled_at"])
      .where("stripe_charge_id", "=", chargeId)
      .execute();
    if (!orders.length) {
      console.warn(`[dispute] ${dispute.id}: no orders for charge ${chargeId}`);
      return { handled: false };
    }
    const orderIds = orders.map((o) => o.id);

    await db.transaction().execute(async (trx) => {
      const itemIds = (
        await trx.selectFrom("order_items").select("id").where("order_id", "in", orderIds).execute()
      ).map((i) => i.id);

      if (!closed) {
        await trx
          .updateTable("orders")
          .set({ status: "disputed", updated_at: new Date().toISOString() })
          .where("id", "in", orderIds)
          .where("status", "in", ["paid", "fulfilled"])
          .execute();
        if (itemIds.length) {
          await trx
            .updateTable("payouts")
            .set({ status: "on_hold" })
            .where("order_item_id", "in", itemIds)
            .where("status", "=", "pending")
            .execute();
        }
        return;
      }

      if (outcome === "won") {
        for (const o of orders) {
          await trx
            .updateTable("orders")
            .set({ status: o.fulfilled_at ? "fulfilled" : "paid", updated_at: new Date().toISOString() })
            .where("id", "=", o.id)
            .where("status", "=", "disputed")
            .execute();
        }
        if (itemIds.length) {
          await trx
            .updateTable("payouts")
            .set({ status: "pending" })
            .where("order_item_id", "in", itemIds)
            .where("status", "=", "on_hold")
            .execute();
        }
        return;
      }

      // lost
      await trx
        .updateTable("orders")
        .set({ status: "refunded", updated_at: new Date().toISOString() })
        .where("id", "in", orderIds)
        .execute();
      if (!itemIds.length) return;
      await trx
        .updateTable("licenses")
        .set({ is_active: false, revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .where("order_item_id", "in", itemIds)
        .where("is_active", "=", true)
        .execute();
      await trx
        .updateTable("payouts")
        .set({ status: "failed" })
        .where("order_item_id", "in", itemIds)
        .where("status", "in", ["pending", "on_hold"])
        .execute();
      const paid = await trx
        .selectFrom("payouts")
        .select(["id", "seller_id"])
        .where("order_item_id", "in", itemIds)
        .where("status", "=", "paid")
        .execute();
      for (const p of paid) {
        console.warn(`[dispute] CLAWBACK NEEDED: payout ${p.id} (seller ${p.seller_id}) - dispute ${dispute.id} lost`);
      }
    });

    return { handled: true, orderIds, status: dispute.status };
  }

  // BUG FIX: refunds used to be a console.log. A refunded order stayed
  // "paid", its licenses stayed active and the seller payout was still due,
  // so the platform could pay out money it had already returned.
  //
  // Full refund  -> orders 'refunded', licenses revoked, unpaid payouts
  //                 'failed' (the only non-payable status the schema allows).
  // Partial refund -> flagged in logs for manual handling (we cannot tell
  //                 which line was refunded from the charge alone).
  // Payouts already marked 'paid' are logged for clawback by finance.
  static async handleRefund(charge) {
    const chargeId = typeof charge === "string" ? charge : charge?.id;
    if (!chargeId) return { handled: false };

    const isFull =
      typeof charge === "object" && charge
        ? Number(charge.amount_refunded) >= Number(charge.amount)
        : true;

    const orders = await db
      .selectFrom("orders")
      .select(["id", "status"])
      .where("stripe_charge_id", "=", chargeId)
      .execute();

    if (!orders.length) {
      console.warn(`[refund] No orders found for charge ${chargeId}`);
      return { handled: false };
    }

    if (!isFull) {
      console.warn(
        `[refund] PARTIAL refund on charge ${chargeId} (orders ${orders
          .map((o) => o.id)
          .join(", ")}) - needs manual review`
      );
      return { handled: false, partial: true };
    }

    const orderIds = orders.map((o) => o.id);

    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("orders")
        .set({ status: "refunded", updated_at: new Date().toISOString() })
        .where("id", "in", orderIds)
        .where("status", "!=", "refunded")
        .execute();

      const items = await trx
        .selectFrom("order_items")
        .select("id")
        .where("order_id", "in", orderIds)
        .execute();
      const itemIds = items.map((i) => i.id);
      if (!itemIds.length) return;

      await trx
        .updateTable("licenses")
        .set({
          is_active: false,
          revoked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where("order_item_id", "in", itemIds)
        .where("is_active", "=", true)
        .execute();

      await trx
        .updateTable("payouts")
        .set({ status: "failed" }) // payouts has no updated_at column
        .where("order_item_id", "in", itemIds)
        .where("status", "=", "pending")
        .execute();

      const alreadyPaid = await trx
        .selectFrom("payouts")
        .select(["id", "seller_id", "net_cents"])
        .where("order_item_id", "in", itemIds)
        .where("status", "=", "paid")
        .execute();
      for (const p of alreadyPaid) {
        console.warn(
          `[refund] CLAWBACK NEEDED: payout ${p.id} to seller ${p.seller_id} was already paid for refunded charge ${chargeId}`
        );
      }
    });

    return { handled: true, orderIds };
  }
}

module.exports = OrderFulfillmentService;
