// src/routes/search.js
const express = require('express');
const { globalSearch } = require('../controller/search.controller');

const router = express.Router();

router.get('/', globalSearch);

module.exports = router;
