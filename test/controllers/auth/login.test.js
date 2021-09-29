const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.CI ?
  'mongodb://localhost' :
  `mongodb+srv://${process.env.MONGO_USER ? `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@` : ''}${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}-test?retryWrites=true`;

const User = require('../../../models/user');
const { login } = require('../../../controllers/auth/login');

describe('Auth Controller - Login', function() {
  let res;

  before(function(done) {
    mongoose
      .connect(MONGODB_URI)
      .then(result => {
        const user = new User({
          email: 'test99@test.com',
          password: '$2b$12$UVQgIVys4FfHs.iOxOdOJ.0JsdfTo1EeCc0nzN9W.aFlv.5Io30Gm',
          name: 'Test',
          posts: [],
          _id: '5c0f66b979af55031b34728a'
        });
        return user.save();
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
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    login(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Invalid email or password');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(4);
      done();
    }).catch(err => {
      done(err);
    });

    User.findOne.restore();
  });

  it('should return an error if the user is not found in the db', function(done) {
    const req = {
      body: {
        email: 'test999999@test.com',
        password: 'tester'
      }
    };
    login(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(401);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Invalid email or password');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(2);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return an error if the password is incorrect', function(done) {
    const req = {
      body: {
        email: 'test99@test.com',
        password: 'wrong password'
      }
    };
    login(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.equal(401);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.be.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.be.equal('Invalid email or password');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.be.equal(3);
      done();
    }).catch(err => {
      done(err);
    });
  });

  it('should return an error if jwt sign returns empty value', function(done) {
    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    sinon.stub(jwt, 'sign');
    jwt.sign.throws();
    login(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(500);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('FAILURE');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('Invalid email or password');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(4);
      expect(jwt.sign.called).to.be.true;
      jwt.sign.restore();
      done();
    }).catch(err => {
      jwt.sign.restore();
      done(err);
    });
  });

  it('should return token and userid if successfully logged in', function(done) {
    const req = {
      body: {
        email: 'test99@test.com',
        password: 'tester'
      }
    };
    login(req, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(200);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.equal('User logged in');
      expect(res).to.have.property('errorCode');
      expect(res.errorCode).to.equal(0);
      // expect(jwt.sign.called).to.be.true;
      expect(res).to.have.property('values');
      expect(res.values).to.have.property('token');
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
