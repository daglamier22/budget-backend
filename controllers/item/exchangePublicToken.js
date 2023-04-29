const logger = require('../../utils/logger');
const client = require('../../utils/plaid');

const filename = 'exchangePublicToken'; // used for logging

exports.exchangePublicToken = async (req, res, next) => {
  logger.info(`${filename}: Request - ${req.userId} token: ${req.token}`);
  const request = {
    user: {
      public_token: req.token
    }
  };
  try {
    const exchangePublicTokenResponse = await client.itemPublicTokenExchange(request);
    logger.info(`${filename}: Response - ${req?.userId} ${JSON.stringify(exchangePublicTokenResponse?.data)}`);
    res.status(200).json({
      apiMessage: '',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        access_token: exchangePublicTokenResponse?.data?.access_token,
        item_id: exchangePublicTokenResponse?.data?.item_id
      }
    });
  } catch (err) {
    logger.error(`${filename}: Response Error - ${req?.userId} ${JSON.stringify(err?.response?.data)}`);
    return res.status(err?.statuscode | 500).json({
      apiMessage: 'Unable to exchange public token for access token',
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        access_token: '',
        item_id: ''
      }
    });
  }
};
