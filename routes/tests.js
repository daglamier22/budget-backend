const express = require('express');

const testController = require('../controllers/tests');

const router = express.Router();

router.post('/helloworld', testController.postHelloWorld);

router.get('/version', testController.getVersion);

module.exports = router;
