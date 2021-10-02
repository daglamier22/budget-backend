const express = require('express');
const { body } = require('express-validator');

const { getAccounts } = require('../controllers/account/getAccounts');
const { addAccount } = require('../controllers/account/addAccount');
const { editAccount } = require('../controllers/account/editAccount');

const isAuth = require('../middleware/is-auth');
const Account = require('../models/account');

const router = express.Router();

router.get('/getAccounts', isAuth, getAccounts);

router.post(
  '/addAccount',
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
  addAccount
);

router.post(
  '/editAccount',
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
  editAccount
);

module.exports = router;
