const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    console.log('Not authenticated');
    return res.status(401).json({status: 'FAILURE', message: 'Not authenticated'});
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch(err) {
    console.log('Not authenticated');
    return res.status(500).json({status: 'FAILURE', message: 'Not authenticated'});
  }
  if (!decodedToken) {
    console.log('Not authenticated');
    return res.status(401).json({status: 'FAILURE', message: 'Not authenticated'});
  }
  req.userId = decodedToken.userId;
  next();
};
