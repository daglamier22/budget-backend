const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const User = require('../../models/user');

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('postSignup: Error -', errors.array()[0].msg);
    return res.status(422).json({
      apiMessage: errors.array()[0].msg,
      apiStatus: 'FAILURE',
      errorCode: 1,
      values: {
        id: undefined,
        token: undefined,
        userId: undefined
      }
    });
  }

  console.log('postSignup: Request -', req.body);

  try {
    const user = await User.findOne({email: email});
    if (user) {
      console.log('postSignup: User already exists -', email);
      return res.status(400).json({
        apiMessage: 'User already exists',
        apiStatus: 'FAILURE',
        errorCode: 2,
        values: {
          id: undefined,
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
    console.log('postSignup: User created -', email);
    return res.status(201).json({
      apiMessage: 'User created',
      apiStatus: 'SUCCESS',
      errorCode: 3,
      values: {
        id: result._id,
        token: undefined,
        userId: undefined
      }
    });
  } catch(err) {
    console.log('postSignup: Response Error -', err.toString());
    res.status(err.statuscode | 500).json({
      apiMessage: 'Unable to create user',
      apiStatus: 'FAILURE',
      errorCode: 4,
      values: {
        id: undefined,
        token: undefined,
        userId: undefined
      }
    });
  }
};
