const chai = require('chai');
const expect = chai.expect;

const { getVersion } = require('../../controllers/tests');

describe('Test Controller - Version', function() {
  let res;

  beforeEach(function() {
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.apiStatus = data.apiStatus;
        this.apiMessage = data.apiMessage;
      }
    };
  });

  it('should return success with the current version number', function(done) {
    getVersion({}, res, () => {}).then(() => {
      expect(res).to.have.property('statusCode');
      expect(res.statusCode).to.be.equal(200);
      expect(res).to.have.property('apiStatus');
      expect(res.apiStatus).to.equal('SUCCESS');
      expect(res).to.have.property('apiMessage');
      expect(res.apiMessage).to.not.equal(undefined);
      done();
    }).catch(err => {
      done(err);
    });
  });
});
