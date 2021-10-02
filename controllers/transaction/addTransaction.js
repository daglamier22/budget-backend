const logger = require('../../utils/logger');
const { validationResult } = require('express-validator');

const Transaction = require('../../models/transaction');
const filename = 'addTransaction'; // used for logging

exports.addTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`${filename}: Error - ${message}`);
    return res.status(400).json({
      apiMessage: message,
      apiStatus: 'FAILURE',
      errorCode: 1
    });
  }

  logger.info(`${filename}: Request - ${req.body}`);

  const transaction = new Transaction({
    userId: req.userId,
    date: req.body.date,
    accountName: req.body.accountNameId,
    description: req.body.description,
    categoryParent: req.body.categoryParent,
    categoryChild: req.body.categoryChild,
    amount: req.body.amount,
    transactionType: req.body.transactionType,
    note: req.body.note
  });
  try {
    await transaction.save();
    logger.info(`${filename}: Response - ${req.body.description}`);
    res.status(201).json({
      apiMessage: 'Transaction created',
      apiStatus: 'SUCCESS',
      errorCode: 0
    });
  } catch(err) {
    let message = 'Unable to create transaction';
    logger.error(`${filename}: Response Error - ${err}`);
    res.status(err.statuscode | 500).json({
      apiMessage: message,
      apiStatus: 'FAILURE',
      errorCode: 2
    });
  }
};
