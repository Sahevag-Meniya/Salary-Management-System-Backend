const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Export filtered salary data to CSV
router.get('/export', (req, res, next) => reportController.exportCsv(req, res, next));

module.exports = router;
