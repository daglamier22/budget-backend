const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    console.log('Not authenticated');
    return res.status(401).json({apiStatus: 'FAILURE', apiMessage: 'Not authenticated', errorCode: 1});
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err) {
    console.log('Not authenticated');
    return res.status(401).json({apiStatus: 'FAILURE', apiMessage: 'Not authenticated', errorCode: 2});
  }
  if (!decodedToken) {
    console.log('Not authenticated');
    return res.status(401).json({apiStatus: 'FAILURE', apiMessage: 'Not authenticated', errorCode: 3});
  }
  req.userId = decodedToken.userId;
  next();
};
