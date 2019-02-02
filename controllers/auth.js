const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.postSignup =  (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password != confirmPassword) {
    console.log('postSignup: Passwords do not match -', email);
    return res.status(400).json({status: 'FAILURE', message: 'Passwords do not match'});
  }
  User.findOne({email: email})
    .then(user => {
      if (user) {
        console.log('postSignup: User already exists -', email);
        return res.status(400).json({status: 'FAILURE', message: 'User already exists'});
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const newUser = new User({
            email: email,
            password: hashedPassword
          });
          return newUser
            .save();
        })
        .then(result => {
          console.log('postSignup: User created -', email);
          return res.status(201).json({status: 'SUCCESS', message: 'User created'});
        });
    })
    .catch(err => {
      console.log('postSignup:', err);
    });
};

exports.postLogin =  (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email})
    .then(user => {
      if (!user) {
        console.log('postLogin: User not found -', email);
        return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              if (err) {
                console.log(err);
              }
              console.log('postLogin: User successfully logged in -', email);
              return res.json({status: 'SUCCESS', message: 'User logged in.'});
            });
          }
          console.log('postLogin: Password does not match for user -', email);
          return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
        })
        .catch(err => {
          console.log('postLogin:', err);
          return res.status(401).json({status: 'FAILURE', message: 'Invalid email or password.'});
        });
    })
    .catch(err => {
      console.log('postLogin:', err);
    });
};

exports.postLogout =  (req, res, next) => {
  if (!req.user) {
    console.log('postLogout: No user logged in');
    return res.json({status: 'FAILURE', message: 'No user logged in'});
  }
  req.session.destroy((err) => {
    if (err) {
      console.log('postLogout:', err);
      return res.json({status: 'FAILURE', message: err});
    }
    console.log('postLogout: User successfully logged out', req.user.email);
    return res.json({status: 'SUCCESS', message: 'User logged out'});
  });
};
