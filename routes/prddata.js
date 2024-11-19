const express = require('express');
const { getProductData } = require('../controllers/prddatacontroller');
const router = express.Router();

router.route('/prddata').get(getProductData);

module.exports = router;