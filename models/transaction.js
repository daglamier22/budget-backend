const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  accountName: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categoryParent: {
    type: String,
    required: true
  },
  categoryChild: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    required: true
  },
  note: {
    type: String
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
