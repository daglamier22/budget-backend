const logger = require('../../utils/logger');

const Account = require('../../models/account');

exports.getAccounts = async (req, res, next) => {
  logger.info(`getAccounts: Request - ${req.userId}`);
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
    logger.info(`getAccounts: Response - ${req.userId} ${returnedAccounts}`);
    return res.status(200).json({
      apiMessage: 'Accounts retrieved',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        accounts: returnedAccounts
      }
    });
  } catch (err) {
    logger.error(`getAccounts: Response Error - ${req.userId} ${err}`);
    return res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to retrieve accounts',
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        accounts: []
      }
    });
  }
};
