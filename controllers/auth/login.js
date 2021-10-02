const logger = require('../../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../../models/user');
const filename = 'login'; // used for logging

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`${filename}: Error - ${errors.array()[0].msg}`);
    return res.status(400).json({
      apiMessage: errors.array()[0].msg,
      apiStatus: 'FAILURE',
      errorCode: 1,
      values: {
        token: undefined,
        userId: undefined
      }
    });
  }

  logger.info(`${filename}: Request - ${req.body}`);

  try {
    const user = await User.findOne({email: email});
    if (!user) {
      logger.error(`${filename}: User not found - ${email}`);
      return res.status(401).json({
        apiMessage: 'Invalid email or password',
        apiStatus: 'FAILURE',
        errorCode: 2,
        values: {
          token: undefined,
          userId: undefined
        }
      });
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      logger.error(`${filename}: Password does not match for user - ${email}`);
      return res.status(401).json({
        apiMessage: 'Invalid email or password',
        apiStatus: 'FAILURE',
        errorCode: 3,
        values: {
          token: undefined,
          userId: undefined
        }
      });
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h'}
    );
    logger.info(`${filename}: User successfully logged in - ${email}`);
    return res.status(200).json({
      apiMessage: 'User logged in',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        token: token,
        userId: user._id.toString(),
      }
    });
  } catch(err) {
    logger.error(`${filename}: Response Error - ${err}`);
    return res.status(500).json({
      apiMessage: 'Invalid email or password',
      apiStatus: 'FAILURE',
      errorCode: 4,
      values: {
        token: undefined,
        userId: undefined
      }
    });
  }
};
