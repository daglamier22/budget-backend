const logger = require('../../utils/logger');

const Transaction = require('../../models/transaction');
const filename = 'getTransactionsByUserId'; // used for logging

exports.getTransactionsByUserId = async (req, res, next) => {
  logger.info(`${filename}: Request - ${req.userId}`);
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
      errorCode: 1,
      values: {
        transactions: []
      }
    });
  }
};
