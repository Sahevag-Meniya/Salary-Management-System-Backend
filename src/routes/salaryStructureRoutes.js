const express = require('express');
const router = express.Router();
const salaryStructureController = require('../controllers/salaryStructureController');

// Filter dropdown values
router.get('/filters', (req, res, next) => salaryStructureController.getFilterOptions(req, res, next));

// List structures with pagination, search, filter, and sorting
router.get('/', (req, res, next) => salaryStructureController.getSalaryStructures(req, res, next));

// Get single employee salary structure details
router.get('/:id', (req, res, next) => salaryStructureController.getSalaryStructureById(req, res, next));

// Create a new employee salary structure
router.post('/', (req, res, next) => salaryStructureController.createSalaryStructure(req, res, next));

// Update an existing employee salary structure
router.put('/:id', (req, res, next) => salaryStructureController.updateSalaryStructure(req, res, next));

// Delete an employee salary structure
router.delete('/:id', (req, res, next) => salaryStructureController.deleteSalaryStructure(req, res, next));

module.exports = router;
