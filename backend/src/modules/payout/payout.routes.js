const router = require('express').Router();

const controller = require('./payout.controller');
const {
  authenticateToken,
} = require('../../common/middleware/auth.middleware');
router.use(authenticateToken);

router.get('/mine', controller.getMyPayouts);

module.exports = router;
