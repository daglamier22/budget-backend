const { version } = require('../package.json');

exports.postHelloWorld =  (req, res, next) => {
  res.json({message: 'Hello World!'});
};

exports.getVersion = (req, res, next) => {
  res.json({message: version});
};
