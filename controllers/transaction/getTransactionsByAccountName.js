const logger = require('../../utils/logger');
const { validationResult } = require('express-validator');

const Transaction = require('../../models/transaction');
const filename = 'getTransactionsByAccountName'; // used for logging

exports.getTransactionsByAccountName = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`${filename}: Error - ${message}`);
    return res.status(400).json({
      apiMessage: message,
      apiStatus: 'FAILURE',
      errorCode: 1,
      values: {
        transactions: []
      }
    });
  }

  logger.info(`${filename}: Request - ${req.userId}`);
  try {
    const dbTransactions = await Transaction.find({userId: req.userId, accountName: req.params.accountId});
    const returnedTransactions = [];
    dbTransactions.forEach(transaction => {
      returnedTransactions.push({
        _id: transaction._id,
        date: transaction.date,
        accountName: transaction.accountName,
        description: transaction.description,
        categoryParent: transaction.categoryParent,
        categoryChild: transaction.categoryChild,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        note: transaction.note
      });
    });
    logger.info(`${filename}: Response - ${req.userId} ${returnedTransactions}`);
    return res.status(200).json({
      apiMessage: 'Transactions retrieved',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        transactions: returnedTransactions
      }
    });
  } catch (err) {
    logger.error(`${filename}: Response Error - ${req.userId} ${err}`);
    return res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to retrieve transactions',
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        transactions: []
      }
    });
  }
};
