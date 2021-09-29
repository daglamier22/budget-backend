const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../../middleware/is-auth');

describe('Auth middleware', function() {
  let res;

  beforeEach(function() {
    res = {
      statusCode: 0,
      apiStatus: null,
      apiMessage: null,
      errorCode: 0,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.apiStatus = data.apiStatus;
        this.apiMessage = data.apiMessage;
        this.errorCode = data.errorCode;
      }
    };
  });

  it('should return an error if no authorization header is present', function() {
    const req = {
      get: function(headerName) {
        return null;
      }
    };
    authMiddleware(req, res, () => {});
    expect(res).to.have.property('statusCode');
    expect(res.statusCode).to.be.equal(401);
    expect(res).to.have.property('apiStatus');
    expect(res.apiStatus).to.equal('FAILURE');
    expect(res).to.have.property('apiMessage');
    expect(res.apiMessage).to.equal('Not authenticated');
    expect(res).to.have.property('errorCode');
    expect(res.errorCode).to.equal(1);
  });

  it('should throw an error if the authorization header is only one string', function() {
    const req = {
      get: function(headerName) {
        return 'xyz';
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should return an error if the token cannot be verified', function() {
    const req = {
      get: function(headerName) {
        return 'Bearer xyz';
      }
    };
    authMiddleware(req, res, () => {});
    expect(res).to.have.property('statusCode');
    expect(res.statusCode).to.be.equal(401);
    expect(res).to.have.property('apiStatus');
    expect(res.apiStatus).to.equal('FAILURE');
    expect(res).to.have.property('apiMessage');
    expect(res.apiMessage).to.equal('Not authenticated');
    expect(res).to.have.property('errorCode');
    expect(res.errorCode).to.equal(2);
  });

  it('should return an error if jwt verify returns empty value', function() {
    const req = {
      get: function(headerName) {
        return 'Bearer sdfasdfasdfasfasdf';
      }
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns(null);
    authMiddleware(req, res, () => {});
    expect(res).to.have.property('statusCode');
    expect(res.statusCode).to.be.equal(401);
    expect(res).to.have.property('apiStatus');
    expect(res.apiStatus).to.equal('FAILURE');
    expect(res).to.have.property('apiMessage');
    expect(res.apiMessage).to.equal('Not authenticated');
    expect(res).to.have.property('errorCode');
    expect(res.errorCode).to.equal(3);
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });

  it('should yield a userId after decoding the token', function() {
    const req = {
      get: function(headerName) {
        return 'Bearer sdfasdfasdfasfasdf';
      }
    };
    sinon.stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'abc' });
    authMiddleware(req, res, () => {});
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
