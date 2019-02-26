const { validationResult } = require('express-validator/check');

const Transaction = require('../models/transaction');

exports.getAllTransactions = async (req, res, next) => {
  console.log('getTransactions: Request -', req.userId);
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
    console.log('getTransactions: Response -', req.userId, returnedTransactions);
    res.status(200).json({
      message: 'Transactions retrieved',
      status: 'SUCCESS',
      values: {
        transactions: returnedTransactions
      }
    });
  } catch (err) {
    console.log('getTransactions: Response Error -', req.userId, err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve transactions',
      status: 'FAILURE'
    });
  }
};

exports.getAccountTransactions = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    console.log('getAccountTransactions: Error -', message);
    return res.status(400).json({
      message: message,
      status: 'FAILURE'
    });
  }

  console.log('getAccountTransactions: Request -', req.userId);
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
    console.log('getAccountTransactions: Response -', req.userId, returnedTransactions);
    res.status(200).json({
      message: 'Transactions retrieved',
      status: 'SUCCESS',
      values: {
        transactions: returnedTransactions
      }
    });
  } catch (err) {
    console.log('getAccountTransactions: Response Error -', req.userId, err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve transactions',
      status: 'FAILURE'
    });
  }
};

exports.postAddTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    console.log('postAddTransaction: Error -', message);
    return res.status(400).json({
      message: message,
      status: 'FAILURE'
    });
  }

  console.log('postAddTransaction: Request -', req.body);

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
    console.log('postAddTransaction: Response -', req.body.description);
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
    console.log('postAddTransaction: Response Error -', err.toString());
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
    console.log('postEditTransaction: Error -', message);
    return res.status(400).json({
      errors: message,
      status: 'FAILURE'
    });
  }

  console.log('postEditTransaction: Request -', req.body);

  try {
    const transaction = await Transaction.findById(req.body._id);
    if (!transaction) {
      const message = 'Could not find transaction';
      console.log('postEditTransaction: Response Error -', message);
      res.status(404).json({
        message: message,
        status: 'FAILURE'
      });
    }
    if (transaction.userId.toString() !== req.userId) {
      const message = 'Not authorized';
      console.log('postEditTransaction: Response Error -', message);
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
    console.log('postEditTransaction: Response-', req.body._id);
    res.status(200).json({
      message: 'Transaction updated',
      status: 'SUCCESS'
    });
  } catch(err) {
    console.log('postEditTransaction: Response Error -', err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to edit transaction',
      status: 'FAILURE'
    });
  }
};
