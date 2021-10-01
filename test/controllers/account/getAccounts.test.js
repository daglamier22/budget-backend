const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const mongoose = require('mongoose');
const MONGODB_URI = process.env.CI ?
  'mongodb://localhost' :
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}-test?retryWrites=true`;

const Account = require('../../../models/account');
const { getAccounts } = require('../../../controllers/account/getAccounts');

describe('Account Controller - Get Accounts', function() {
  let res;

  before(function(done) {
    mongoose
      .connect(MONGODB_URI)
      .then(result => {
        const account = new Account({
          _id: '5c0f66b979af55031b34728a',
          userId: '5c0f66b979af55031b34728a',
          firmName: 'firmName',
          accountName: 'accountName',
          accountType: 'accountType',
          originalBalance: '0.0',
          currentBalance: '20.0',
          interestRate: '',
          creditLimit: '',
          loanTerm: '',
          loanOriginationDate: ''
        });
        return account.save();
      })
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  beforeEach(function() {
    res = {
      statusCode: null,
      apiStatus: null,
      apiMessage: null,
      errorCode: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.apiStatus = data.apiStatus;
        this.apiMessage = data.apiMessage;
        this.errorCode = data.errorCode;
        this.values = data.values;
      }
    };
  });

  it('should return an error if accessing the database fails', function(done) {
    sinon.stub(Account, 'find');
    Account.find.throws();

    const req = {
      userId: '5c0f66b979af55031b34728a',
    };
    getAccounts(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Unable to retrieve accounts');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });

    Account.find.restore();
  });

  it('should return empty list if no accounts found for this userid', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728b',
    };
    getAccounts(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(200);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Accounts retrieved');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(0);
      expect(res).to.have.property('values');
      expect(res.values).to.have.property('accounts');
      expect(res.values.accounts).to.have.length(0);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return accounts if accounts found for this userid', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728a',
    };
    getAccounts(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(200);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Accounts retrieved');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(0);
      expect(res).to.have.property('values');
      expect(res.values).to.have.property('accounts');
      expect(res.values.accounts).to.have.length(1);
      done();
    }).catch(err => {
      done(err);
    });
  });

  after(function(done) {
    Account.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
