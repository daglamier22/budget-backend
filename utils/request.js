const logger = require('./logger');

const filename = 'createRequest';
const requestProperty = {
  params: 'params',
  body: 'body',
  headers: 'headers',
  query: 'query',
  cookies: 'cookies'
};
const createRequest = (originalReq, newReq, property, values) => {
  try {
    if (!originalReq) {
      return;
    }

    if (!newReq.cookies) {
      newReq.cookies = originalReq.cookies;
      newReq.userId = originalReq.userId;
    }

    if (Object.values(requestProperty).includes(property) && newReq && typeof newReq === 'object' && values && typeof values === 'object') {
      if (property === 'cookies') {
        newReq.cookies = Object.assign(newReq.cookies, values); // Add the new cookies into the req.cookies property, updating existing values if keys overlap
      } else {
        newReq[property] = values;
      }
    }
    if (!newReq['query']) {
      newReq['query'] = [];
    }
  } catch (err) {
    logger.error(`${filename}: Response Error - ${originalReq?.userId} ${JSON.stringify(err)}`);
  }
};

module.exports = { createRequest, requestProperty };
