const express = require('express');
const { body, header } = require('express-validator');

const { addTransaction } = require('../controllers/transaction/addTransaction');
const { editTransaction } = require('../controllers/transaction/editTransaction');
const { getTransactionsByAccountName } = require('../controllers/transaction/getTransactionsByAccountName');
const { getTransactionsByUserId } = require('../controllers/transaction/getTransactionsByUserId');

const isAuth = require('../middleware/is-auth');
const Transaction = require('../models/transaction');
const Account = require('../models/account');

const router = express.Router();

router.get('/getTransactionsByUserId', isAuth, getTransactionsByUserId);

router.get('/get-account-transactions',
  isAuth,
  [
    header('accountId').isString().custom((value, { req }) => {
      return Account.findOne({ userId: req.userId, _id: value })
        .then(account => {
          if (!account) {
            return Promise.reject('An account with this name does not exist');
          }
        });
    })
  ],
  getTransactionsByAccountName
);

router.post(
  '/addTransaction',
  isAuth,
  [
    body('date').isString(),
    body('accountName').isString().custom((value, { req }) => {
      return Account.findOne({ userId: req.userId, accountName: value })
        .then(account => {
          if (!account) {
            return Promise.reject('An account with this name does not exist');
          }
          req.body.accountNameId = account._id;
        });
    }),
    body('description').isString(),
    body('categoryParent').isString(),
    body('categoryChild').isString(),
    body('amount').isString(),
    body('transactionType').isString()
  ],
  addTransaction
);

router.post(
  '/editTransaction',
  isAuth,
  [
    body('_id').isString().custom((value, { req }) => {
      return Transaction.findById(req.body._id)
        .then(transaction => {
          if (!transaction) {
            return Promise.reject('Could not find transaction');
          }
        })
        .catch(error => {
          if (error !== 'Could not find transaction') {
            return Promise.reject('Invalid Object ID');
          }
        });
    }),
    body('date').isString(),
    body('accountName').isString().custom((value, { req }) => {
      return Account.findOne({ userId: req.userId, accountName: value })
        .then(account => {
          if (!account) {
            return Promise.reject('An account with this name does not exist');
          }
          req.body.accountNameId = account._id;
        });
    }),
    body('description').isString(),
    body('categoryParent').isString(),
    body('categoryChild').isString(),
    body('amount').isString(),
    body('transactionType').isString()
  ],
  editTransaction
);

module.exports = router;
