const logger = require('../../utils/logger');
const { client } = require('../../utils/plaid');

const Account = require('../../models/account');
const Item = require('../../models/item');
const filename = 'refreshItem'; // used for logging

exports.refreshItem = async (req, res, next) => {
  logger.info(`${filename}: Request - ${req.userId} - ${req.params.accountId}`);
  const dbAccount = await Account.findOne({accountId: req.params.accountId});
  const itemId = dbAccount.itemId;
  const dbItems = await Item.findOne({itemId: itemId});
  const accessToken = dbItems.plaidAccessToken;
  const request = {
    access_token: accessToken
  };
  try {
    const transactionsRefreshResponse = await client.transactionsRefresh(request);
    logger.info(`${filename}: Response - ${req?.userId} ${JSON.stringify(transactionsRefreshResponse?.data)}`);
    res.status(200).json({
      apiMessage: '',
      apiStatus: 'SUCCESS',
      errorCode: 0
    });
  } catch (err) {
    logger.error(`${filename}: Response Error - ${req?.userId} ${JSON.stringify(err?.response?.data)}`);
    return res.status(err?.statuscode | 500).json({
      apiMessage: 'Unable to create link token',
      apiStatus: 'FAILURE',
      errorCode: 1
    });
  }
};
