const logger = require('./logger');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Item = require('../models/item');
const Account = require('../models/account');
const Transaction = require('../models/transaction');

const filename = 'plaid'; // used for logging

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});
const client = new PlaidApi(configuration);

const updateItemAccountsAndTransactions = async (itemId) => {
  try {
    // Retrieve the Item being updated
    const dbItem = await Item.findOne({ plaidItemId: itemId });
    const accessToken = dbItem.plaidAccessToken;
    const lastCursor = dbItem.transactionsCursor;
    const userId = dbItem.userId;

    // Fetch new transaction updates from Plaid
    const {
      added,
      modified,
      removed,
      cursor
    } = await fetchTransactionUpdates(itemId, accessToken, lastCursor);

    // Fetch accounts from Plaid to check for new accounts
    const accounts = await accountsGet(itemId, accessToken);

    // Update DB with new data
    await createAccounts(userId, itemId, accounts);
    await createTransactions(userId, added);
    await updateTransactions(userId, modified);
    await deleteTransactions(userId, removed);
    await updateItemTransactionsCursor(dbItem, cursor);

    return {
      addedCount: added.length,
      modifiedCount: modified.length,
      removedCount: removed.length
    };
  } catch (err) {
    logger.error(`${filename} updateTransactions: An error occured attempting to update transactions - ${err.message}`);
    return {
      addedCount: 0,
      modifiedCount: 0,
      removedCount: 0
    };
  }
};

const fetchTransactionUpdates = async (itemId, accessToken, lastCursor) => {
  logger.info(`${filename} fetchTransactionUpdates: Request - ${itemId}`);

  let cursor = lastCursor;

  // New transaction updates since "cursor"
  let added = [];
  let modified = [];
  // Removed transaction ids
  let removed = [];
  let hasMore = true;
  try {
    while (hasMore) {
      const request = {
        access_token: accessToken,
        cursor: cursor
      };
      const response = await client.transactionsSync(request);
      logger.info(`${filename} fetchTransactionUpdates: transactionsSync Response - ${JSON.stringify(response.data)}`);
      const data = response.data;
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }
  } catch(err) {
    logger.error(`${filename} fetchTransactionUpdates: Error fetching transactions: ${err.message}`);
    cursor = lastCursor;
  }

  return { added, modified, removed, cursor };
};

const accountsGet = async (itemId, accessToken) => {
  try{
    logger.info(`${filename} accountsGet: Request - ${itemId}`);
    const request = {
      access_token: accessToken
    };
    const { data: {accounts} } = await client.accountsGet(request);
    logger.info(`${filename} accountsGet: Response - ${JSON.stringify(accounts)}`);
    return accounts;
  } catch (err) {
    logger.error(`${filename} accountsGet: Error fetching accounts: ${err.message}`);
  }
};

const createAccounts = async (userId, itemId, accounts) => {
  try {
    const dbAccounts = await Account.find({userId: userId});
    for (let i = 0; i < accounts.length; i++) {
      const dbIndex = dbAccounts.findIndex(e => e.plaidAccountId === accounts[i].account_id);
      if (dbIndex === -1) { // add new account
        const account = new Account({
          userId: userId,
          itemId: itemId,
          plaidAccountId: accounts[i].account_id,
          balances: {
            available: accounts[i].balances.available,
            current: accounts[i].balances.current,
            isoCurrencyCode: accounts[i].balances.iso_currency_code,
            limit: accounts[i].balances.limit
          },
          mask: accounts[i].mask,
          accountName: accounts[i].name,
          officialName: accounts[i].official_name,
          accountType: accounts[i].type,
          accountSubType: accounts[i].subtype
        });
        await account.save();
      } else { // update account
        dbAccounts[dbIndex].userId = userId;
        dbAccounts[dbIndex].itemId = itemId;
        dbAccounts[dbIndex].plaidAccountId = accounts[i].account_id;
        dbAccounts[dbIndex].balances.available = accounts[i].balances.available;
        dbAccounts[dbIndex].balances.current =  accounts[i].balances.current;
        dbAccounts[dbIndex].balances.isoCurrencyCode = accounts[i].balances.iso_currency_code;
        dbAccounts[dbIndex].balances.limit = accounts[i].balances.limit;
        dbAccounts[dbIndex].mask = accounts[i].mask;
        dbAccounts[dbIndex].accountName = accounts[i].name;
        dbAccounts[dbIndex].officialName = accounts[i].official_name;
        dbAccounts[dbIndex].accountType = accounts[i].type;
        dbAccounts[dbIndex].accountSubType = accounts[i].subtype;
        await dbAccounts[dbIndex].save();
      }
    }
  } catch (err) {
    logger.error(`${filename} createAccounts: Error creating accounts: ${err.message}`);
  }
};

const createTransactions = async (userId, transactions) => {
  try {
    // transactions.forEach(async element => {
    //   const newTransaction = new new Transaction({
    //     userId: userId,
    //     date: req.body.date,
    //     accountName: req.body.accountNameId,
    //     description: req.body.description,
    //     categoryParent: req.body.categoryParent,
    //     categoryChild: req.body.categoryChild,
    //     amount: req.body.amount,
    //     transactionType: req.body.transactionType,
    //     note: req.body.note
    //   });
    //   await newTransaction.save();
    // });
  } catch (err) {
    logger.error(`${filename} createTransactions: Error updating transactions: ${err.message}`);
  }
};

const updateTransactions = async (userId, transactions) => {
  try {
  } catch (err) {
    logger.error(`${filename} updateTransactions: Error updating transactions: ${err.message}`);
  }
};

const deleteTransactions = async (userId, transactions) => {
  try {
    // const dbTransactions = await Transaction.find({userId: userId});
  } catch (err) {
    logger.error(`${filename} deleteTransactions: Error deleting transactions: ${err.message}`);
  }
};

const updateItemTransactionsCursor = async (dbItem, cursor) => {
  try {
    dbItem.transactionsCursor = cursor;
    await dbItem.save();
  } catch (err) {
    logger.error(`${filename} updateItemTransactionsCursor: Error updating transactions cursor: ${err.message}`);
  }
};

const updateItemStatus = async (itemId, status) => {
  try {
    const dbItem = await Item.findOne({ itemId: itemId });
    dbItem.status = status;
    await dbItem.save();
  } catch (err) {
    logger.error(`${filename} updateItemStatus: Error updating item status: ${err.message}`);
  }
};

module.exports = { client, updateItemAccountsAndTransactions, fetchTransactionUpdates, accountsGet, createAccounts, createTransactions, updateTransactions, deleteTransactions, updateItemTransactionsCursor, updateItemStatus };
