const salaryService = require('../services/salaryService');

class SalaryController {
  async getSalaries(req, res, next) {
    try {
      const result = await salaryService.getSalaryRecords(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  async getSalaryById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryService.getSalaryById(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async createSalary(req, res, next) {
    try {
      const result = await salaryService.createSalaryRecord(req.body);
      res.status(201).json({
        success: true,
        message: 'Employee salary record created successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSalary(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryService.updateSalaryRecord(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Employee salary record updated successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteSalary(req, res, next) {
    try {
      const { id } = req.params;
      const result = await salaryService.deleteSalaryRecord(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getFilterOptions(req, res, next) {
    try {
      const options = await salaryService.getFilterOptions();
      res.status(200).json({
        success: true,
        data: options
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SalaryController();
