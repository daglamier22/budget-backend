const express = require('express');
const { body } = require('express-validator/check');

const accountController = require('../controllers/account');
const isAuth = require('../middleware/is-auth');
const Account = require('../models/account');

const router = express.Router();

router.get('/get-accounts', isAuth, accountController.getAccounts);

router.post(
  '/add-account',
  isAuth,
  [
    body('firmName').isString(),
    body('accountName').isString().custom((value, { req }) => {
      return Account.findOne({ userId: req.userId, accountName: value })
        .then(account => {
          if (account) {
            return Promise.reject('An account with this name was already created');
          }
        });
    }),
    body('accountType').isString(),
    body('originalBalance').isString(),
    body('currentBalance').isString()
  ],
  accountController.postAddAccount
);

router.post(
  '/edit-account',
  isAuth,
  [
    body('_id').isString().custom((value, { req }) => {
      return Account.findById(req.body._id)
        .then(account => {
          if (!account) {
            return Promise.reject('Could not find account');
          }
        })
        .catch(error => {
          if (error !== 'Could not find account') {
            return Promise.reject('Invalid Object ID');
          }
        });
    }),
    body('firmName').isString(),
    body('accountName').isString(),
    body('accountType').isString(),
    body('originalBalance').isString(),
    body('currentBalance').isString()
  ],
  accountController.postEditAccount
);

module.exports = router;
