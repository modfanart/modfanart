const express = require('express');
const router = express.Router();
const PayoutController = require('../controller/payout.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/connect', authenticateToken, PayoutController.createConnectAccount);
router.get('/status', authenticateToken, PayoutController.getConnectStatus);

module.exports = router;