const salaryStructureService = require('../services/salaryStructureService');

class SalaryStructureController {
  async getSalaryStructures(req, res, next) {
    try {
      const result = await salaryStructureService.getSalaryStructures(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  async getSalaryStructureById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryStructureService.getSalaryStructureById(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async createSalaryStructure(req, res, next) {
    try {
      const result = await salaryStructureService.createSalaryStructure(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee salary structure created successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSalaryStructure(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryStructureService.updateSalaryStructure(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee salary structure updated successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteSalaryStructure(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryStructureService.deleteSalaryStructure(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getFilterOptions(req, res, next) {
    try {
      const options = await salaryStructureService.getFilterOptions();
      res.status(200).json({
        success: true,
        data: options
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SalaryStructureController();
