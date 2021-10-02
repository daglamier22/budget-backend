const logger = require('../../utils/logger');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const User = require('../../models/user');
const filename = 'signup'; // used for logging

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(`${filename}: Error - ${errors.array()[0].msg}`);
    return res.status(422).json({
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
    if (user) {
      logger.error(`${filename}: User already exists - ${email}`);
      return res.status(400).json({
        apiMessage: 'User already exists',
        apiStatus: 'FAILURE',
        errorCode: 2,
        values: {
          token: undefined,
          userId: undefined
        }
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      password: hashedPassword
    });
    const result = await newUser.save();
    logger.info(`${filename}: User created - ${email}`);
    return res.status(201).json({
      apiMessage: 'User created',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        userId: result._id.toString(),
        token: undefined
      }
    });
  } catch(err) {
    logger.error(`${filename}: Response Error - ${err}`);
    res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to create user',
      apiStatus: 'FAILURE',
      errorCode: 3,
      values: {
        token: undefined,
        userId: undefined
      }
    });
  }
};
