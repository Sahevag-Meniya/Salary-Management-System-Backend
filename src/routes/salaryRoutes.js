const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// Filter dropdown values
router.get('/filters', (req, res, next) => salaryController.getFilterOptions(req, res, next));

// List records with pagination, search, filter, and sorting
router.get('/', (req, res, next) => salaryController.getSalaries(req, res, next));

// Get single employee salary details
router.get('/:id', (req, res, next) => salaryController.getSalaryById(req, res, next));

// Create a new employee salary record
router.post('/', (req, res, next) => salaryController.createSalary(req, res, next));

// Update an existing employee salary record
router.put('/:id', (req, res, next) => salaryController.updateSalary(req, res, next));

// Delete an employee salary record
router.delete('/:id', (req, res, next) => salaryController.deleteSalary(req, res, next));

module.exports = router;
