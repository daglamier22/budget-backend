const logger = require('../../utils/logger');
const { validationResult } = require('express-validator');

const Account = require('../../models/account');

exports.addAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    logger.error(`postAddAccount: Error - ${message}`);
    return res.status(400).json({
      apiMessage: message,
      apiStatus: 'FAILURE',
      errorCode: 1
    });
  }

  logger.info(`postAddAccount: Request - ${req.body}`);

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
    logger.info(`postAddAccount: Response - ${req.body.accountName}`);
    return res.status(201).json({
      apiMessage: 'Account created',
      apiStatus: 'SUCCESS',
      errorCode: 0
    });
  } catch(err) {
    let message;
    if (err.code === 11000) {
      message = 'An account with this name was already created';
    } else {
      message = 'Unable to create account';
    }
    logger.error(`postAddAccount: Response Error - ${err}`);
    return res.status(err.statuscode | 500).json({
      apiMessage: message,
      apiStatus: 'FAILURE',
      errorCode: 2
    });
  }
};
