const { version } = require('../package.json');

exports.getVersion = (req, res, next) => {
  res.json({message: version});
};
