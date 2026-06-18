const express = require("express");
const router = express.Router();
const PayoutController = require("./controller/payout.controller");
const webhookController = require("./controller/webhook.controller");

const {
  authenticateToken,
} = require("../../common/middleware/auth.middleware");

router.post(
  "/connect",
  authenticateToken,
  PayoutController.createConnectAccount
);
router.get("/status", authenticateToken, PayoutController.getConnectStatus);
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook
);
module.exports = router;
