const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: Schema.Types.String,
    required: true
  },
  plaidAccountId: {
    type: String
  },
  balances: {
    available: {
      type: Number
    },
    current: {
      type: Number
    },
    isoCurrencyCode: {
      type: String
    },
    limit: {
      type: Number
    }
  },
  mask: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true,
    unique: true
  },
  officialName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    required: true
  },
  accountSubType: {
    type: String,
    required: true
  }
});

accountSchema.index({
  userId: 1,
  itemId: 1,
  plaidAccountId: 1
}, {unique: true, background: true});

module.exports = mongoose.model('Account', accountSchema);
