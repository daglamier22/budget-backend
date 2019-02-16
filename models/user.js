const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  descriptionsList: [
    {
      type: String
    }
  ],
  categoryList: [
    {
      parent: {
        type: String
      },
      child: {
        type: String
      }
    }
  ],
  billList: [
    {
      categoryParent: {
        type: String
      },
      categoryChild: {
        type: String
      },
      amount: {
        type: Number
      }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
