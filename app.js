const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const testRoutes = require('./routes/tests');

// parse incoming json post bodies
app.use(bodyParser.json());
// add various security headers
app.use(helmet());
// log incoming requests
app.use(morgan('combined'));

app.use('/tests', testRoutes);

app.listen(process.env.PORT || 3000);
