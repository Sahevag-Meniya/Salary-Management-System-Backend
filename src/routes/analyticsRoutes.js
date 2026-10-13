const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// High-level KPI summary
router.get('/summary', (req, res, next) => analyticsController.getSummary(req, res, next));

// Country-wise breakdown
router.get('/by-country', (req, res, next) => analyticsController.getByCountry(req, res, next));

// Department-wise breakdown
router.get('/by-department', (req, res, next) => analyticsController.getByDepartment(req, res, next));

// Designation-wise breakdown
router.get('/by-designation', (req, res, next) => analyticsController.getByDesignation(req, res, next));

module.exports = router;
