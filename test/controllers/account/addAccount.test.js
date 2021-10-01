const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const mongoose = require('mongoose');
const MONGODB_URI = process.env.CI ?
  'mongodb://localhost' :
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}-test?retryWrites=true`;

const Account = require('../../../models/account');
const { addAccount } = require('../../../controllers/account/addAccount');

describe('Account Controller - Add Account', function() {
  let res;

  before(function(done) {
    mongoose
      .connect(MONGODB_URI)
      .then(result => {
        const account = new Account({
          _id: '6c0f66b979af55031b34728a',
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

  it('should return an error if saving to the database fails', function(done) {
    sinon.stub(Account.prototype, 'save');
    Account.prototype.save.throws();

    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        firmName: 'dummyFirmName',
        accountName: 'dummyAccountName',
        accountType: 'dummyAccountType',
        originalBalance: 'dummyOriginalBalance',
        currentBalance: 'dummyCurrentBalance',
        interestRate: 'dummyInterestRate',
        creditLimit: 'dummyCreditLimit',
        loanTerm: 'dummyLoanTerm',
        loanOriginationDate: 'dummyLoanOriginationDate'
      }
    };
    addAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Unable to create account');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });

    Account.prototype.save.restore();
  });

  it('should return an error if account already exists', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        firmName: 'dummyFirmName',
        accountName: 'accountName', // this needs to match account name we setup in before function
        accountType: 'dummyAccountType',
        originalBalance: 'dummyOriginalBalance',
        currentBalance: 'dummyCurrentBalance',
        interestRate: 'dummyInterestRate',
        creditLimit: 'dummyCreditLimit',
        loanTerm: 'dummyLoanTerm',
        loanOriginationDate: 'dummyLoanOriginationDate'
      }
    };
    addAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('An account with this name was already created');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return success if account created', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        firmName: 'dummyFirmName',
        accountName: 'dummyAccountName',
        accountType: 'dummyAccountType',
        originalBalance: 'dummyOriginalBalance',
        currentBalance: 'dummyCurrentBalance',
        interestRate: 'dummyInterestRate',
        creditLimit: 'dummyCreditLimit',
        loanTerm: 'dummyLoanTerm',
        loanOriginationDate: 'dummyLoanOriginationDate'
      }
    };
    addAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(201);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Account created');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(0);
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
