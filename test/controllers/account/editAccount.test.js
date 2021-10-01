const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const mongoose = require('mongoose');
const MONGODB_URI = process.env.CI ?
  'mongodb://localhost' :
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}-test?retryWrites=true`;

const Account = require('../../../models/account');
const { editAccount } = require('../../../controllers/account/editAccount');

describe('Account Controller - Edit Account', function() {
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
    sinon.stub(mongoose.Model, 'findById');
    mongoose.Model.findById.throws();

    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        _id: '6c0f66b979af55031b34728a',
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
    editAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Unable to edit account');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(4);
      done();
    }).catch(err => {
      done(err);
    });

    mongoose.Model.findById.restore();
  });

  it('should return an error if the account cannot be found', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        _id: '5c0f66b979af55031b34728a', // this needs to be different than the _id setup in the before function
        firmName: 'dummyFirmName',
        accountName: 'accountName',
        accountType: 'dummyAccountType',
        originalBalance: 'dummyOriginalBalance',
        currentBalance: 'dummyCurrentBalance',
        interestRate: 'dummyInterestRate',
        creditLimit: 'dummyCreditLimit',
        loanTerm: 'dummyLoanTerm',
        loanOriginationDate: 'dummyLoanOriginationDate'
      }
    };
    editAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(404);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Could not find account');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return an error if the account does not belong to this user', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728b', // needs to be different than the userId in the before function
      body: {
        _id: '6c0f66b979af55031b34728a',
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
    editAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(403);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Not authorized');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(3);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return success if account edited', function(done) {
    const req = {
      userId: '5c0f66b979af55031b34728a',
      body: {
        _id: '6c0f66b979af55031b34728a',
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
    editAccount(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(200);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Account updated');
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
