const express = require('express');

const accountController = require('../controllers/account');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/get-accounts', isAuth, accountController.getAccounts);

router.post('/add-account', isAuth, accountController.postAddAccount);

router.post('/edit-account', isAuth, accountController.postEditAccount);

module.exports = router;
