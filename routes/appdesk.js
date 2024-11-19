const express = require('express');
const { appDeskCount } = require('../controllers/appdeskController');
const router = express.Router();

router.route('/appdesk/:empsrno/:ecnumber').get(appDeskCount);

module.exports = router;