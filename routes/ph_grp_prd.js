const express = require('express');
const { getPhGrpPrdData } = require('../controllers/ph_grp_prd_controller');
const router = express.Router();

router.route('/ph_grp_prd').get(getPhGrpPrdData);

module.exports = router;