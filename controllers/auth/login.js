const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../../models/user');

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('postLogin: Error -', errors.array()[0].msg);
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

  console.log('postLogin: Request -', req.body);

  try {
    const user = await User.findOne({email: email});
    if (!user) {
      console.log('postLogin: User not found -', email);
      return res.status(401).json({
        apiMessage: 'Invalid email or password.',
        apiStatus: 'FAILURE',
        errorCode: 2,
        values: {
          id: undefined,
          token: undefined,
          userId: undefined
        }
      });
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      console.log('postLogin: Password does not match for user -', email);
      return res.status(401).json({
        apiMessage: 'Invalid email or password.',
        apiStatus: 'FAILURE',
        errorCode: 3,
        values: {
          id: undefined,
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
    console.log('postLogin: User successfully logged in -', email);
    return res.status(200).json({
      apiMessage: 'User logged in.',
      apiStatus: 'SUCCESS',
      errorCode: 0,
      values: {
        token: token,
        userId: user._id.toString(),
        id: undefined
      }
    });
  } catch(err) {
    console.log('postLogin: Response Error -', err.toString());
    return res.status(401).json({
      apiMessage: 'Invalid email or password.',
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
