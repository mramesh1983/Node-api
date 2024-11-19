const express = require('express');
const { getFilteredData } = require('../controllers/empdatacontroller');
const router = express.Router();

router.route('/empdata').get(getFilteredData);

module.exports = router;