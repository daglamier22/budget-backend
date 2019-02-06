const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const morgan = require('morgan');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-y8hb4.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true`;

const User = require('./models/user');

const testRoutes = require('./routes/tests');
const authRoutes = require('./routes/auth');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

// handle cors with the cors package
const allowedOrigins = [
  'http://localhost:4200',
  'https://daglamier22.github.io'
];
app.use(cors({
  methods: ['GET, POST, PUT, PATCH, DELETE, OPTIONS'],
  exposedHeaders: ['Content-Type, Authorization'],
  credentials: true,
  origin: (origin, callback) => {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// parse incoming json post bodies
app.use(bodyParser.json());

// session middleware
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

// add various security headers
app.use(helmet());

// log incoming requests
app.use(morgan('combined'));

app.use('/tests', testRoutes);
app.use(authRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true})
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
