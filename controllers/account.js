const Account = require('../models/account');

exports.getAccounts = async (req, res, next) => {
  console.log(req.body);
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
    res.status(200).json({
      message: 'Accounts retrieved',
      status: 'SUCCESS',
      accounts: returnedAccounts
    });
  } catch (err) {
    res.status(err.statuscode | 500).json({
      message: 'Unable to retrieve accounts',
      status: 'FAILURE'
    });
  }
};

exports.postAddAccount = async (req, res, next) => {
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
    res.status(err.statuscode | 500).json({
      message: message,
      status: 'FAILURE'
    });
  }
};

exports.postEditAccount = async (req, res, next) => {
  console.log(req.body);
  res.json('');
};
