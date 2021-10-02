const logger = require('../../utils/logger');
const { validationResult } = require('express-validator');

const Transaction = require('../../models/transaction');
const filename = 'editTransaction'; // used for logging

exports.editTransaction = async (req, res, next) => {
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
    const transaction = await Transaction.findById(req.body._id);
    if (!transaction) {
      const message = 'Could not find transaction';
      logger.error(`${filename}: Response Error - ${message}`);
      return res.status(404).json({
        apiMessage: message,
        apiStatus: 'FAILURE',
        errorCode: 2
      });
    }
    if (transaction.userId.toString() !== req.userId) {
      const message = 'Not authorized';
      logger.error(`${filename}: Response Error - ${message}`);
      return res.status(403).json({
        apiMessage: message,
        apiStatus: 'FAILURE',
        errorCode: 3
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
    logger.info(`${filename}: Response- ${req.body._id}`);
    return res.status(200).json({
      apiMessage: 'Transaction updated',
      apiStatus: 'SUCCESS',
      errorCode: 0
    });
  } catch(err) {
    logger.error(`${filename}: Response Error - ${err}`);
    return res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to edit transaction',
      apiStatus: 'FAILURE',
      errorCode: 4
    });
  }
};
