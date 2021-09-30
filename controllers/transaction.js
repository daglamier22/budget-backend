const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

const Transaction = require('../models/transaction');

exports.getAllTransactions = async (req, res, next) => {
  logger.info(`getTransactions: Request - ${req.userId}`);
  try {
    const dbTransactions = await Transaction.find({userId: req.userId});
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
    logger.info(`getTransactions: Response - ${req.userId} ${returnedTransactions}`);
    res.status(200).json({
      message: 'Transactions retrieved',
      status: 'SUCCESS',
      values: {
        transactions: returnedTransactions
      }
    });
  } catch (err) {
    logger.error(`getTransactions: Response Error - ${req.userId} ${err}`);
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve transactions',
      status: 'FAILURE',
      values: {
        transactions: []
      }
    });
  }
};

exports.getAccountTransactions = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`getAccountTransactions: Error - ${message}`);
    return res.status(400).json({
      message: message,
      status: 'FAILURE',
      values: {
        transactions: []
      }
    });
  }

  logger.info(`getAccountTransactions: Request - ${req.userId}`);
  try {
    const dbTransactions = await Transaction.find({userId: req.userId, accountName: req.headers.accountid});
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
    logger.info(`getAccountTransactions: Response - ${req.userId} ${returnedTransactions}`);
    res.status(200).json({
      message: 'Transactions retrieved',
      status: 'SUCCESS',
      values: {
        transactions: returnedTransactions
      }
    });
  } catch (err) {
    logger.error(`getAccountTransactions: Response Error - ${req.userId} ${err}`);
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve transactions',
      status: 'FAILURE',
      values: {
        transactions: []
      }
    });
  }
};

exports.postAddTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`postAddTransaction: Error - ${message}`);
    return res.status(400).json({
      message: message,
      status: 'FAILURE'
    });
  }

  logger.info(`postAddTransaction: Request - ${req.body}`);

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
    logger.info(`postAddTransaction: Response - ${req.body.description}`);
    res.status(201).json({
      message: 'Transaction created',
      status: 'SUCCESS'
    });
  } catch(err) {
    let message;
    if (err.code === 11000) {
      message = 'An account with this name was already created';
    } else {
      message = 'Unable to create transaction';
    }
    logger.error(`postAddTransaction: Response Error - ${err}`);
    res.status(err.statuscode | 500).json({
      message: message,
      status: 'FAILURE'
    });
  }
};

exports.postEditTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`postEditTransaction: Error - ${message}`);
    return res.status(400).json({
      errors: message,
      status: 'FAILURE'
    });
  }

  logger.info(`postEditTransaction: Request - ${req.body}`);

  try {
    const transaction = await Transaction.findById(req.body._id);
    if (!transaction) {
      const message = 'Could not find transaction';
      logger.error(`postEditTransaction: Response Error - ${message}`);
      res.status(404).json({
        message: message,
        status: 'FAILURE'
      });
    }
    if (transaction.userId.toString() !== req.userId) {
      const message = 'Not authorized';
      logger.error(`postEditTransaction: Response Error - ${message}`);
      res.status(403).json({
        message: message,
        status: 'FAILURE'
      });
    }
    transaction.date = req.body.date;
    transaction.accountName = req.body.accountNameId;
    transaction.description = req.body.description;
    transaction.categoryParent = req.body.categoryParent;
    transaction.categoryChild = req.body.categoryChild;
    transaction.amount = req.body.amount;
    transaction.transactionType = req.body.transactionType;
    transaction.note = req.body.note;
    await transaction.save();
    logger.info(`postEditTransaction: Response- ${req.body._id}`);
    res.status(200).json({
      message: 'Transaction updated',
      status: 'SUCCESS'
    });
  } catch(err) {
    logger.error(`postEditTransaction: Response Error - ${err}`);
    res.status(err.statuscode | 500).json({
      message: 'Unable to edit transaction',
      status: 'FAILURE'
    });
  }
};
