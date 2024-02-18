const logger = require('../../utils/logger');
const { updateItemAccountsAndTransactions } = require('../../utils/plaid');

const filename = 'Plaid webHook'; // used for logging

exports.webhook = async (req, res, next) => {
  logger.info(`${filename}:`);
  try {
    // console.dir(req.body), { colors: true, depth: null};
    const product = req.body.webhook_type;
    const code = req.body.webhook_code;
    switch (product) {
    case 'ITEM':
      handleItemWebhook(code, req.body);
      break;
    case 'TRANSACTIONS':
      handleTransactionsWebhook(code, req.body);
      break;
    }
    return res.json({ status: 'recieved' });
  } catch (err) {
    let errorMessage = err?.response?.data ? JSON.stringify(err?.response?.data) : (err.message ? err.message : err);
    logger.error(`${filename}: Error - ${req?.userId} ${errorMessage}`);
    return res.status(err?.statuscode | 500).json({
      status: 'error'
    });
  }
};

const handleTransactionsWebhook = async (code, requestBody) => {
  let response;
  switch (code) {
  case 'INITIAL_UPDATE':
  case 'HISTORICAL_UPDATE':
  case 'DEFAULT_UPDATE':
  case 'TRANSACTIONS_REMOVED':
    // logger.info(`${filename}: ${code} ignored: Not needed due to using Transactions Sync API`);
    break;
  case 'SYNC_UPDATES_AVAILABLE':
    logger.info(`${filename}: ${code} recieved: There are new updates available for the Transactions Sync API`);
    response = await updateItemAccountsAndTransactions(requestBody.item_id);
    logger.info(`${filename}: addedCount - ${response.addedCount} - modifiedCount - ${response.modifiedCount} - removedCount - ${response.removedCount}`);
    break;
  default:
    logger.error(`${filename}: Can't handle webhook code ${code}`);
    break;
  }
};

const handleItemWebhook = (code, requestBody) => {
  switch (code) {
  case 'ERROR':
    logger.info(`${filename}: I received this error: ${requestBody.error.error_message}| should probably ask this user to connect to their bank`);
    // TODO: - notify user of error and reconnect item
    break;
  case 'NEW_ACCOUNTS_AVAILABLE':
    logger.info(`${filename}: There are new accounts available at this Financial Institution! (Id: ${requestBody.item_id}) We might want to ask the user to share them with us`);
    // TODO: - notify user for permission to add new accounts
    break;
  case 'PENDING_EXPIRATION':
    logger.info(`${filename}: We should tell our user to reconnect their bank with Plaid so there's no disruption to their service`);
    // TODO: - notify user to reconnect item
    break;
  case 'USER_PERMISSION_REVOKED':
    logger.info(`${filename}: The user revoked access to this item. We should remove it from our records`);
    // TODO: - remove item and associated accounts and transactions
    break;
  case 'WEBHOOK_UPDATE_ACKNOWLEDGED':
    logger.info(`${filename}: Hooray! Webhook found the right spot and was successfully updated!`);
    break;
  default:
    logger.error(`${filename}: Can't handle webhook code ${code}`);
    break;
  }
};
