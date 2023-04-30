const logger = require('../../utils/logger');
const { createRequest, requestProperty } = require('../../utils/request');
const { exchangePublicToken } = require('./exchangePublicToken');
const Item = require('../../models/item');

const filename = 'createItem'; // used for logging

exports.createItem = async (req, res, next) => {
  logger.info(`${filename}: Request - ${req.userId}`);
  try {
    // exchange public token for permenant private token
    const exchangePublicTokenRequest = {};
    createRequest(req, exchangePublicTokenRequest, requestProperty.body, {
      publicToken: req.body.publicToken
    });
    const exchangePublicTokenResponse = await exchangePublicToken(exchangePublicTokenRequest, res, next, filename);
    if (exchangePublicTokenResponse.apiStatus !== 'SUCCESS') {
      throw new Error(exchangePublicTokenResponse.apiMessage);
    }
    // ensure this User doesn't already have an Item for this Institution
    const existingItems = await Item.findOne({userId: req.userId, plaidInstitutionId: req.body.institutionId});
    if (existingItems) {
      throw new Error('You have already linked an item at this institution.');
    }
    // create Item entry in DB
    const item = new Item({
      userId: req.userId,
      plaidItemId: exchangePublicTokenResponse?.values?.item_id,
      plaidAccessToken: exchangePublicTokenResponse?.values?.access_token,
      plaidInstitutionId: req.body.institutionId
    });
    await item.save();
    logger.info(`${filename}: Response - ${req?.userId} ${JSON.stringify(exchangePublicTokenResponse)}`);
    res.status(200).json({
      apiMessage: '',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        item_id: exchangePublicTokenResponse?.values?.item_id
      }
    });
  } catch (err) {
    let errorMessage = err?.response?.data ? JSON.stringify(err?.response?.data) : (err.message ? err.message : err);
    logger.error(`${filename}: Response Error - ${req?.userId} ${errorMessage}`);
    return res.status(err?.statuscode | 500).json({
      apiMessage: errorMessage,
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        access_token: '',
        item_id: ''
      }
    });
  }
};
