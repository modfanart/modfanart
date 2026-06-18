const { randomUUID } = require("crypto");
const { db } = require("../../../config");
const {
  generateLicensePDF,
  generateInvoicePDF,
} = require("../../../common/utils/pdfGenerators");

class OrderFulfillmentService {
  static async fulfillOrder(paymentIntent) {
    const orderId = paymentIntent.metadata?.order_id;

    if (!orderId) {
      throw new Error("Missing order_id in payment intent metadata");
    }

    const order = await db
      .selectFrom("orders")
      .select(["id", "status"])
      .where("id", "=", orderId)
      .executeTakeFirst();

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== "pending") {
      console.log(`Order ${orderId} already ${order.status} - skipping`);
      return { alreadyProcessed: true };
    }

    return await db.transaction().execute(async (trx) => {
      const orderItem = await trx
        .selectFrom("order_items")
        .select(["id", "artwork_id", "license_type"])
        .where("order_id", "=", orderId)
        .executeTakeFirstOrThrow();

      const artwork = await trx
        .selectFrom("artworks")
        .select(["id", "title", "creator_id"])
        .where("id", "=", orderItem.artwork_id)
        .executeTakeFirstOrThrow();

      const seller = await trx
        .selectFrom("users")
        .select(["id", "username", "email"])
        .where("id", "=", artwork.creator_id)
        .executeTakeFirstOrThrow();

      const buyer = await trx
        .selectFrom("users")
        .select(["id", "username", "email"])
        .where("id", "=", paymentIntent.metadata.buyer_id)
        .executeTakeFirstOrThrow();

      await trx
        .updateTable("orders")
        .set({
          status: "paid",
          stripe_charge_id:
            paymentIntent.latest_charge || paymentIntent.charges?.data?.[0]?.id,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .where("id", "=", orderId)
        .execute();

      const licenseId = randomUUID();

      await trx
        .insertInto("licenses")
        .values({
          id: licenseId,
          order_item_id: orderItem.id,
          artwork_id: orderItem.artwork_id,
          buyer_id: paymentIntent.metadata.buyer_id,
          seller_id: artwork.creator_id,
          license_type: orderItem.license_type,
          contract_pdf_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      let contractUrl = null;
      let invoiceUrl = null;

      try {
        [contractUrl, invoiceUrl] = await Promise.all([
          generateLicensePDF(
            {
              id: licenseId,
              license_type: orderItem.license_type,
              created_at: new Date().toISOString(),
            },
            order,
            buyer,
            seller,
            artwork
          ),
          generateInvoicePDF(order),
        ]);
      } catch (pdfErr) {
        console.error("PDF generation failed:", pdfErr);
      }

      await Promise.all([
        trx
          .updateTable("licenses")
          .set({
            contract_pdf_url: contractUrl || "generation_failed",
            updated_at: new Date().toISOString(),
          })
          .where("id", "=", licenseId)
          .execute(),

        trx
          .updateTable("orders")
          .set({
            status: "fulfilled",
            invoice_pdf_url: invoiceUrl || "generation_failed",
            invoice_number: `INV-${Date.now().toString().slice(-8)}`,
            fulfilled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .where("id", "=", orderId)
          .execute(),
      ]);

      return {
        success: true,
        orderId,
        licenseId,
        contractUrl,
        invoiceUrl,
      };
    });
  }

  static async markOrderAsFailed(orderId) {
    await db
      .updateTable("orders")
      .set({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", orderId)
      .execute();
  }

  static async handleRefund(chargeId) {
    console.log(`Refund handled for charge: ${chargeId}`);
  }
}

module.exports = OrderFulfillmentService;
