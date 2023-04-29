const logger = require('../../utils/logger');
const client = require('../../utils/plaid');

const filename = 'createLinkToken'; // used for logging

exports.createLinkToken = async (req, res, next) => {
  logger.info(`${filename}: Request - ${req.userId}`);
  const request = {
    user: {
      client_user_id: req.userId
    },
    client_name: 'McHA',
    products: ['auth'],
    language: 'en',
    country_codes: ['US']
  };
  try {
    const createLinkTokenResponse = await client.linkTokenCreate(request);
    logger.info(`${filename}: Response - ${req?.userId} ${JSON.stringify(createLinkTokenResponse?.data)}`);
    res.status(200).json({
      apiMessage: '',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        linkToken: createLinkTokenResponse?.data?.link_token,
        expiration: createLinkTokenResponse?.data?.expiration
      }
    });
  } catch (err) {
    logger.error(`${filename}: Response Error - ${req?.userId} ${JSON.stringify(err?.response?.data)}`);
    return res.status(err?.statuscode | 500).json({
      apiMessage: 'Unable to create link token',
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        linkToken: ''
      }
    });
  }
};
