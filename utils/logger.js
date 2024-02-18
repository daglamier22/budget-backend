const winston = require('winston');
require('winston-mongodb');

const logger = winston.createLogger({
  transports: [
    // default to hiding logs and add special logs below
    new winston.transports.Console({
      silent: true,
      level: 'http'
    })
  ],
  exitOnError: false
});

// only print errors to console in production, and send everything to DB
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
    level: 'error'
  }));
  logger.add(new winston.transports.MongoDB({
    db: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}${process.env.MONGO_DEFAULT_DATABASE_SUB}?retryWrites=true`,
    options: { useUnifiedTopology: true },
    collection: 'logging',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    level: 'http'
  }));
}
//print info and errors to console for local development, but silence sending to DB
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
    level: 'info'
  }));
  logger.add(new winston.transports.MongoDB({
    db: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DEFAULT_DATABASE}${process.env.MONGO_DEFAULT_DATABASE_SUB}?retryWrites=true`,
    options: { useUnifiedTopology: true },
    collection: 'logging',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    // silent: true,
    level: 'http'
  }));
}

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.http(message);
  }
};
