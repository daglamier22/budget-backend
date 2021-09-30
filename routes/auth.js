const express = require('express');
const { check } = require('express-validator');

const { login } = require('../controllers/auth/login');
const { signup } = require('../controllers/auth/signup');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid password').isString().isLength({min: 4}),
    check('confirmPassword', 'Invalid confirmPassword').isString().isLength({min: 4}),
    check('password').custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        return Promise.reject('don\'t match');
      }
      return Promise.resolve();
    })
  ],
  signup
);

router.post(
  '/login',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid password').isString().isLength({min: 4})
  ],
  login
);

module.exports = router;
