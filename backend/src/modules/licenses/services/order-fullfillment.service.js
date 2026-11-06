const { randomUUID } = require("crypto");
const { db } = require("../../../config");
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

    const outcome = await db.transaction().execute(async (trx) => {
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

      let invoiceUrl = null;

      try {
        invoiceUrl = await generateInvoicePDF({
          ...order,
          paid_at: new Date().toISOString(),
        });
      } catch (pdfErr) {
        console.error("Invoice PDF generation failed:", pdfErr);
      }

      const update = {
        invoice_pdf_url: invoiceUrl || "generation_failed",
        invoice_number: `INV-${Date.now().toString().slice(-8)}`,
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

  static async handleRefund(chargeId) {
    console.log(`Refund handled for charge: ${chargeId}`);
  }
}

module.exports = OrderFulfillmentService;
