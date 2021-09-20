const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid password').isString().isLength({min: 4}),
    check('confirmPassword', 'Invalid confirmPassword').isString().isLength({min: 4}),
    check('password').custom((value, { req }) => {
      console.log(value);
      console.log(req.body.confirmPassword);
      if (value !== req.body.confirmPassword) {
        return Promise.reject('don\'t match');
      }
      return Promise.resolve();
    })
  ],
  authController.postSignup
);

router.post(
  '/login',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid password').isString().isLength({min: 4})
  ],
  authController.postLogin
);

module.exports = router;
