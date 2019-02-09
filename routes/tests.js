const express = require('express');

const testController = require('../controllers/tests');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/version', testController.getVersion);

router.get('/version', isAuth, testController.getVersion);

module.exports = router;
