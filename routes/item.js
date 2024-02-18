const express = require('express');

const { createLinkToken } = require('../controllers/item/createLinkToken');
const { createItem } = require('../controllers/item/createItem');
const { exchangePublicToken } = require('../controllers/item/exchangePublicToken');
const { refreshItem } = require('../controllers/item/refreshItem');
const { webhook } = require('../controllers/item/webhook');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/createLinkToken', isAuth, createLinkToken);

router.post('/exchangePublicToken', isAuth, exchangePublicToken);

router.post('/createItem', isAuth, createItem);

router.post('/refresh/:accountId', isAuth, refreshItem);

router.post('/webhook', webhook);

module.exports = router;
