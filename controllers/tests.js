const { version } = require('../package.json');

exports.getVersion = async (req, res, next) => {
  return res.status(200).json({
    apiStatus: 'SUCCESS',
    apiMessage: version
  });
};
