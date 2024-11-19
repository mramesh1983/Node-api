const express = require('express');
const { getPhPrdData } = require('../controllers/ph_prd_controller');
const router = express.Router();

router.route('/ph_prd').get(getPhPrdData);

module.exports = router;