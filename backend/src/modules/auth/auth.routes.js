const express = require('express');
const AuthController = require('./controller/auth.controller');

const router = express.Router();

// Called by frontend after every Firebase sign-in to sync user into our DB
router.post('/sync', AuthController.sync);

module.exports = router;
