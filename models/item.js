const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plaidItemId: {
    type: String,
    required: true
  },
  plaidAccessToken: {
    type: String,
    required: true,
    unique: true
  },
  plaidInstitutionId: {
    type: String,
    required: true
  },
  transactionsCursor: {
    type: String
  }
});

module.exports = mongoose.model('Item', itemSchema);
