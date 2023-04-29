const express = require('express');

const { createLinkToken } = require('../controllers/item/createLinkToken');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/createLinkToken', isAuth, createLinkToken);

module.exports = router;
