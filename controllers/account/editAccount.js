const logger = require('../../utils/logger');
const { validationResult } = require('express-validator');

const Account = require('../../models/account');
const filename = 'editAccount'; // used for logging

exports.editAccount = async (req, res, next) => {
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

  try {
    const account = await Account.findById(req.body._id);
    if (!account) {
      const message = 'Could not find account';
      logger.error(`${filename}: Response Error - ${message}`);
      return res.status(404).json({
        apiMessage: message,
        apiStatus: 'FAILURE',
        errorCode: 2
      });
    }
    if (account.userId.toString() !== req.userId) {
      const message = 'Not authorized';
      logger.error(`${filename}: Response Error - ${message}`);
      return res.status(403).json({
        apiMessage: message,
        apiStatus: 'FAILURE',
        errorCode: 3
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
    logger.info(`${filename}: Response- ${req.body._id}`);
    return res.status(200).json({
      apiMessage: 'Account updated',
      apiStatus: 'SUCCESS',
      errorCode: 0
    });
  } catch(err) {
    logger.error(`${filename}: Response Error - ${err}`);
    return res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to edit account',
      apiStatus: 'FAILURE',
      errorCode: 4
    });
  }
};
