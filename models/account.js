const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firmName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    required: true
  },
  originalBalance: {
    type: String,
    required: true
  },
  currentBalance: {
    type: String,
    required: true
  },
  interestRate: {
    type: String
  },
  creditLimit: {
    type: String
  },
  loanTerm: {
    type: String
  },
  loanOriginationDate: {
    type: String,
  }
});

module.exports = mongoose.model('Account', accountSchema);
