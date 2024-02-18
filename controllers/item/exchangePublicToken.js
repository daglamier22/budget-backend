const logger = require('../../utils/logger');
const { client } = require('../../utils/plaid');

const filename = 'exchangePublicToken'; // used for logging

exports.exchangePublicToken = async (req, res, next, parentFilename = '') => {
  // used to determien if this controller is a child controller and need to return as a promise
  const returnAsPromise = parentFilename !== '';
  try {
    logger.info(`${filename}: Request - ${req.userId} token: ${req.body.publicToken}`);
    const request = {
      public_token: req.body.publicToken
    };
    const exchangePublicTokenResponse = await client.itemPublicTokenExchange(request);
    // hide access token in logs as it is sensitive data
    const loggingResponseMinusSensitiveData = JSON.parse(JSON.stringify(exchangePublicTokenResponse.data));
    if (loggingResponseMinusSensitiveData) {
      loggingResponseMinusSensitiveData.access_token = '****';
    }
    logger.info(`${filename}: Response - ${req?.userId} ${JSON.stringify(loggingResponseMinusSensitiveData)}`);
    const data = {
      apiMessage: '',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        access_token: exchangePublicTokenResponse?.data?.access_token,
        item_id: exchangePublicTokenResponse?.data?.item_id
      }
    };
    if (returnAsPromise) {
      return Promise.resolve(data);
    } else {
      res.status(200).json(data);
    }
  } catch (err) {
    logger.error(`${filename}: Response Error - ${req?.userId} ${err?.response?.data ? JSON.stringify(err?.response?.data) : err.message}`);
    const data = {
      apiMessage: 'Unable to exchange public token for access token',
      apiStatus: 'FAILURE',
      errorCode: 2,
      values: {
        access_token: '',
        item_id: ''
      }
    };
    if (returnAsPromise) {
      return Promise.resolve(data);
    } else {
      return res.status(err?.statuscode | 500).json(data);
    }
  }
};
