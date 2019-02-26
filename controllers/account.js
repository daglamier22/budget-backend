const { validationResult } = require('express-validator/check');

const Account = require('../models/account');

exports.getAccounts = async (req, res, next) => {
  console.log('getAccounts: Request -', req.userId);
  try {
    const dbAccounts = await Account.find({userId: req.userId});
    const returnedAccounts = [];
    dbAccounts.forEach(account => {
      returnedAccounts.push({
        _id: account._id,
        firmName: account.firmName,
        accountName: account.accountName,
        accountType: account.accountType,
        originalBalance: account.originalBalance,
        currentBalance: account.currentBalance,
        interestRate: account.interestRate,
        creditLimit: account.creditLimit,
        loanTerm: account.loanTerm,
        loanOriginationDate: account.loanOriginationDate
      });
    });
    console.log('getAccounts: Response -', req.userId, returnedAccounts);
    res.status(200).json({
      message: 'Accounts retrieved',
      status: 'SUCCESS',
      values: {
        accounts: returnedAccounts
      }
    });
  } catch (err) {
    console.log('getAccounts: Response Error -', req.userId, err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve accounts',
      status: 'FAILURE',
      values: {
        accounts: []
      }
    });
  }
};

exports.postAddAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    console.log('postAddAccount: Error -', message);
    return res.status(400).json({
      message: message,
      status: 'FAILURE'
    });
  }

  console.log('postAddAccount: Request -', req.body);

  const account = new Account({
    userId: req.userId,
    firmName: req.body.firmName,
    accountName: req.body.accountName,
    accountType: req.body.accountType,
    originalBalance: req.body.originalBalance,
    currentBalance: req.body.currentBalance,
    interestRate: req.body.interestRate,
    creditLimit: req.body.creditLimit,
    loanTerm: req.body.loanTerm,
    loanOriginationDate: req.body.loanOriginationDate
  });
  try {
    await account.save();
    console.log('postAddAccount: Response -', req.body.accountName);
    res.status(201).json({
      message: 'Account created',
      status: 'SUCCESS'
    });
  } catch(err) {
    let message;
    if (err.code === 11000) {
      message = 'An account with this name was already created';
    } else {
      message = 'Unable to create account';
    }
    console.log('postAddAccount: Response Error -', err.toString());
    res.status(err.statuscode | 500).json({
      message: message,
      status: 'FAILURE'
    });
  }
};

exports.postEditAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    console.log('postEditAccount: Error -', message);
    return res.status(400).json({
      errors: message,
      status: 'FAILURE'
    });
  }

  console.log('postEditAccount: Request -', req.body);

  try {
    const account = await Account.findById(req.body._id);
    if (!account) {
      const message = 'Could not find account';
      console.log('postEditAccount: Response Error -', message);
      res.status(404).json({
        message: message,
        status: 'FAILURE'
      });
    }
    if (account.userId.toString() !== req.userId) {
      const message = 'Not authorized';
      console.log('postEditAccount: Response Error -', message);
      res.status(403).json({
        message: message,
        status: 'FAILURE'
      });
    }
    account.firmName = req.body.firmName;
    account.accountName = req.body.accountName;
    account.accountType = req.body.accountType;
    account.originalBalance = req.body.originalBalance;
    account.currentBalance = req.body.currentBalance;
    account.interestRate = req.body.interestRate;
    account.creditLimit = req.body.creditLimit;
    account.loanTerm = req.body.loanTerm;
    account.loanOriginationDate = req.body.loanOriginationDate;
    await account.save();
    console.log('postEditAccount: Response-', req.body._id);
    res.status(200).json({
      message: 'Account updated',
      status: 'SUCCESS'
    });
  } catch(err) {
    console.log('postEditAccount: Response Error -', err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to edit account',
      status: 'FAILURE'
    });
  }
};
