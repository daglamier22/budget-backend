const User = require('../models/user');

exports.postLogin =  (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(req.user);
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        return res.json({message: 'Invalid email or password.'});
      }
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        console.log(err);
        res.json({status: 'SUCCESS'});
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout =  (req, res, next) => {
  req.session.destroy((err) => {
    let status = 'SUCCESS';
    let message;
    if (err) {
      console.log(err);
      status = 'FAILURE';
      message = err;
    }
    res.json({status: status, message: message});
  });
};
