const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password != confirmPassword) {
    console.log('postSignup: Passwords do not match -', email);
    return res.status(400).json({status: 'FAILURE', message: 'Passwords do not match'});
  }
  try {
    const user = await User.findOne({email: email});
    if (user) {
      console.log('postSignup: User already exists -', email);
      return res.status(400).json({status: 'FAILURE', message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      password: hashedPassword
    });
    const result = await newUser.save();
    console.log('postSignup: User created -', email);
    return res.status(201).json({status: 'SUCCESS', message: 'User created', id: result._id});
  } catch(err) {
    console.log('postSignup:', err);
  }
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({email: email});
    if (!user) {
      console.log('postLogin: User not found -', email);
      return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      console.log('postLogin: Password does not match for user -', email);
      return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1h'}
    );
    console.log('postLogin: User successfully logged in -', email);
    return res.json({status: 'SUCCESS', message: 'User logged in.', token: token, userId: user._id.toString()});
  } catch(err) {
    console.log('postLogin:', err);
    return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
  }
};
