const { version } = require('../package.json');

exports.postHelloWorld =  (req, res) => {
  res.json({message: 'Hello World!'});
};

exports.getVersion = (req, res) => {
  res.json({message: version});
};
