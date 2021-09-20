const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('postSignup: Error -', errors.array()[0].msg);
    return res.status(422).json({
      message: errors.array()[0].msg,
      status: 'FAILURE',
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
        message: 'User already exists',
        status: 'FAILURE',
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
      message: 'User created',
      status: 'SUCCESS',
      values: {
        id: result._id,
        token: undefined,
        userId: undefined
      }
    });
  } catch(err) {
    console.log('postSignup: Response Error -', err.toString());
    res.status(err.statuscode | 500).json({
      message: 'Unable to create user',
      status: 'FAILURE',
      values: {
        id: undefined,
        token: undefined,
        userId: undefined
      }
    });
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('postLogin: Error -', errors.array()[0].msg);
    return res.status(422).json({
      message: errors.array()[0].msg,
      status: 'FAILURE',
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
        message: 'Invalid email or password.',
        status: 'FAILURE',
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
        message: 'Invalid email or password.',
        status: 'FAILURE',
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
    return res.json({
      message: 'User logged in.',
      status: 'SUCCESS',
      values: {
        token: token,
        userId: user._id.toString(),
        id: undefined
      }
    });
  } catch(err) {
    console.log('postLogin: Response Error -', err.toString());
    return res.status(401).json({
      message: 'Invalid email or password.',
      status: 'FAILURE',
      values: {
        id: undefined,
        token: undefined,
        userId: undefined
      }
    });
  }
};
