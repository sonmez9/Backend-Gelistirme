const express = require('express');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.get('/completed', reportController.getCompleted);
router.get('/pending', reportController.getPending);
router.get('/summary', reportController.getSummary);

module.exports = router;
