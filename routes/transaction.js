const express = require('express');
const { body } = require('express-validator/check');

const transactionController = require('../controllers/transaction');
const isAuth = require('../middleware/is-auth');
const Transaction = require('../models/transaction');
const Account = require('../models/account');

const router = express.Router();

router.get('/get-all-transactions', isAuth, transactionController.getAllTransactions);

router.post(
  '/add-transaction',
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
  transactionController.postAddTransaction
);

router.post(
  '/edit-transaction',
  isAuth,
  [
    body('_id').isString().custom((value, { req }) => {
      console.log('test0');
      return Transaction.findById(req.body._id)
        .then(transaction => {
          console.log('test1');
          if (!transaction) {
            console.log('test2');
            return Promise.reject('Could not find transaction');
          }
          console.log('test3');
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
  transactionController.postEditTransaction
);

module.exports = router;
