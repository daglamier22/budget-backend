const chai = require('chai');
const expect = chai.expect;
const bcrypt = require('bcrypt');
const sinon = require('sinon');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.CI ?
  'mongodb://localhost' :
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}-test?retryWrites=true`;

const User = require('../../../models/user');
const { signup } = require('../../../controllers/auth/signup');

describe('Auth Controller - Signup', function() {
  let res;

  before(function(done) {
    mongoose
      .connect(MONGODB_URI)
      .then(result => {
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
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    signup(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Unable to create user');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(3);
      done();
    }).catch(err => {
      done(err);
    });

    User.findOne.restore();
  });

  it('should return an error if the user already exists in the db', function(done) {
    const user = new User({
      email: 'test98@test.com',
      password: '$2b$12$UVQgIVys4FfHs.iOxOdOJ.0JsdfTo1EeCc0nzN9W.aFlv.5Io30Gm',
      name: 'Test',
      posts: [],
      _id: '5c0f66b979af55031b34728a'
    });
    user.save();
    const req = {
      body: {
        email: 'test98@test.com',
        password: 'tester'
      }
    };
    signup(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(400);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('User already exists');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return an error if bcrypt hash returns empty value', function(done) {
    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    sinon.stub(bcrypt, 'hash');
    bcrypt.hash.throws();
    signup(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Unable to create user');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(3);
      expect(bcrypt.hash.called).to.be.true;
      bcrypt.hash.restore();
      done();
    }).catch(err => {
      bcrypt.hash.restore();
      done(err);
    });
  });

  it('should return userid if successfully signed up', function(done) {
    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    signup(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(201);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('User created');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(0);
      expect(res).to.have.property('values');
      expect(res.values).to.have.property('userId');
      done();
    }).catch(err => {
      done(err);
    });
  });

  after(function(done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
